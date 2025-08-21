import { Router } from "express";
import crypto from "crypto";
import { all, get, run } from '../db.js'; // CHANGED: import run for INSERT/DELETE ops
import { authRequired } from "../middleware/auth.js"; // ADDED: for protected routes
// import { authOptional } from "../middleware/auth.js";
import { attachUserFromJWT } from "../middleware/auth.js";

const router = Router();

// base62 ID generator (22 chars, like "6jI1gFr6ANFtT8MmTvA2Ux")
const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function genBase62Id(len = 22) {
  const out = [];
  while (out.length < len) {
    // rejection sampling to avoid modulo bias
    const buf = crypto.randomBytes(1);
    const v = buf[0];
    if (v < 248) {                 // 248 is 62 * 4; evenly divisible bucket
      out.push(B62[v % 62]);
    }
  }
  return out.join('');
}
// ensure uniqueness in DB (extremely low collision prob, but loop defensively)
async function genUniquePlaylistId() {
  while (true) {
    const id = genBase62Id(22);
    const exists = await get(`SELECT 1 FROM playlists WHERE playlist_id = ?`, [id]);
    if (!exists) return id;
  }
}

// small helpers
function clampInt(value, { def, min, max }) {
  const n = Number.parseInt(value ?? def, 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/**
 * GET /api/playlists
 * Query:
 *   playlist?      - search (matches playlist_name; case-insensitive)
 *   limit?         - default 20, max 20000
 *   offset?        - default 0
 *   mine?          - include my private (is_seed=0) if 'true' and logged in
 * Returns: { items, total, limit, offset }
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = clampInt(req.query.limit,  { def: 20, min: 1, max: 20000 });
    const offset = clampInt(req.query.offset, { def: 0,  min: 0, max: 20000 });

    const playlist = (req.query.playlist ?? '').trim();

    const FROM = `
      FROM playlists p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN appear_in a ON p.playlist_id = a.playlist_id
      LEFT JOIN tracks t ON t.track_id = a.track_id
    `;

    const conds = [];
    const params = [];

    const includeMine = req.query.mine === 'true' && req.user?.id;
    if (includeMine) {
      // public seed OR my user-created
      conds.push(`((p.is_seed = 1 AND p.visibility = 'public') OR (p.is_seed = 0 AND p.user_id = ?))`);
      params.push(req.user.id);
    } else {
      // public seed only
      conds.push(`(p.is_seed = 1 AND p.visibility = 'public')`);
    }

    if (playlist) {
      conds.push(`p.playlist_name LIKE ? COLLATE NOCASE`);
      params.push(`%${playlist}%`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    // Put user-created first, then newest, then name
    const orderBy = `
      ORDER BY
        p.is_seed ASC,
        COALESCE(p.created_at, '0000-00-00 00:00:00') DESC,
        p.playlist_name COLLATE NOCASE ASC
    `;

    // total count
    const totalRow = await get(
      `SELECT COUNT(DISTINCT p.playlist_id) AS total ${FROM} ${where};`,
      params
    );

    // page of items
    const items = await all(
      `
        SELECT
          p.*
        ${FROM}
        ${where}
        GROUP BY p.playlist_id
        ${orderBy}
        LIMIT ? OFFSET ?;
      `,
      [...params, limit, offset]
    );

    res.json({
      items,
      total: totalRow?.total ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
});


/**
 * GET /api/playlists/:id
 * Returns one playlist info
 */
router.get('/:id', async (req, res, next) => {
  try {

    const FROM = `
      FROM playlists p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN appear_in a ON p.playlist_id = a.playlist_id
      LEFT JOIN tracks t ON t.track_id = a.track_id
    `;

    const where = `WHERE p.playlist_id = ?`

    // page of items
    const row = await get(
      `
        SELECT
          p.*,
          json_group_array(
            json_object(
              'track_id', t.track_id,
              'track_name', t.track_name
            )
          ) AS tracks
        ${FROM}
        ${where}
        GROUP BY p.playlist_id;
      `,
      [req.params.id]
    );

    if (!row) return res.status(404).json({ error: 'Playlist not found' });

    // access control — allow public seed, or owner of private
    const isPublicSeed = row.is_seed === 1 && row.visibility === 'public';
    const isOwner = req.user?.id && row.user_id === req.user.id;
    if (!(isPublicSeed || isOwner)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    res.json(row);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/playlists
 * Body: { name, genre?, subgenre?, description?, visibility? }  // visibility defaults to 'private' for user-created
 * Creates a user-owned playlist (is_seed=0).
 */
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { name, genre, subgenre, description, visibility } = req.body || {};
    const playlist_name = String(name ?? '').trim();
    if (!playlist_name) return res.status(400).json({ error: 'playlist_name required' });

    // force non-public for user-created; allow 'private' or 'unlisted' if you use it
    const vis = visibility && visibility !== 'public' ? visibility : 'private';

    const playlist_id = await genUniquePlaylistId();

    const result = await run(
      `
        INSERT INTO playlists
          (playlist_id, playlist_name, playlist_genre, playlist_subgenre, description,
           user_id, created_at, is_seed, visibility)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0, ?);
      `,
      [playlist_id, playlist_name, genre ?? null, subgenre ?? null, description ?? null, req.user.id, vis]
    );

    const created = await get(`SELECT * FROM playlists WHERE playlist_id = ?;`, [playlist_id]);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/playlists/:id/tracks
 * Body: { track_id }
 * Owner-only; cannot modify seed playlists. Uses appear_in as the join table.
 */
router.post('/:id/tracks', authRequired, async (req, res, next) => {
  try {
    const playlist_id = String(req.params.id);
    const { track_id } = req.body || {};
    if (!track_id) return res.status(400).json({ error: 'track_id required' });

    const pl = await get(`SELECT * FROM playlists WHERE playlist_id = ?;`, [playlist_id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id) return res.status(403).json({ error: 'Not owner' });
    if (pl.is_seed === 1) return res.status(400).json({ error: 'Cannot modify seed playlist' });

    await run(
      `INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id) VALUES (?, ?);`,
      [playlist_id, track_id]
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/playlists/:id/tracks/:trackId
 * Owner-only removal.
 */
router.delete('/:id/tracks/:trackId', authRequired, async (req, res, next) => {
  try {
    const playlist_id = String(req.params.id);
    const track_id = req.params.trackId;

    const pl = await get(`SELECT * FROM playlists WHERE playlist_id = ?;`, [playlist_id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id) return res.status(403).json({ error: 'Not owner' });

    await run(
      `DELETE FROM appear_in WHERE playlist_id = ? AND track_id = ?;`,
      [playlist_id, track_id]
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/playlists/:id
 * Owner-only; cannot delete seed playlists.
 */
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const playlist_id = String(req.params.id);

    const pl = await get(`SELECT * FROM playlists WHERE playlist_id = ?;`, [playlist_id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id) return res.status(403).json({ error: 'Not owner' });
    if (pl.is_seed === 1) return res.status(400).json({ error: 'Cannot delete seed playlist' });

    // delete tracks first in case FK cascade isn't set
    await run(`DELETE FROM appear_in WHERE playlist_id = ?;`, [playlist_id]);
    await run(`DELETE FROM playlists WHERE playlist_id = ?;`, [playlist_id]);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
