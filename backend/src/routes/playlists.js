import { Router } from "express";
import crypto from "crypto";
import { all, get } from '../db.js';

const router = Router();

// small helpers
function clampInt(value, { def, min, max }) {
  const n = Number.parseInt(value ?? def, 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/**
 * GET /api/playlists
 * Query:
 *   playlist?      - search (matches album_name; case-insensitive)
 *   limit?  - default 20, max 100
 *   offset? - default 0
 * Returns: { items, total, limit, offset }
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = clampInt(req.query.limit, { def: 20, min: 1, max: 471 });
    const offset = clampInt(req.query.offset, { def: 0, min: 0, max: 471 });

    const playlist = (req.query.playlist ?? '').trim();

    const FROM = `
              FROM playlists p
              LEFT JOIN users u ON p.user_id = u.id
              LEFT JOIN appear_in a ON p.playlist_id = a.playlist_id
              LEFT JOIN tracks t ON t.track_id = a.track_id
          `;

    const conds = [];
    const params = [];

    if (playlist) {
      conds.push('p.playlist_name LIKE ? COLLATE NOCASE');
      params.push(`%${playlist}%`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    // total
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
    const row = await all(
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

    if (!row) return res.status(404).json({ error: 'Track not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, desc } = req.body;
    const id = crypto.randomUUID();
    await db.run(
      "INSERT INTO playlists (id, name, desc) VALUES (?, ?, ?)",
      id, name, desc || null
    );
    res.status(201).json({ id, name, desc, trackIds: [] });
  } catch (err) { next(err); }
});

router.post("/:plId/tracks/:trackId", async (req, res, next) => {
  const { plId, trackId } = req.params;
  try {
    await db.run(
      "INSERT OR IGNORE INTO playlist_tracks VALUES (?, ?)",
      plId, trackId
    );
    res.sendStatus(204);
  } catch (err) { next(err); }
});

router.delete("/:plId/tracks/:trackId", async (req, res, next) => {
  const { plId, trackId } = req.params;
  try {
    await db.run(
      "DELETE FROM playlist_tracks WHERE playlist_id=? AND track_id=?",
      plId, trackId
    );
    res.sendStatus(204);
  } catch (err) { next(err); }
});

export default router;
