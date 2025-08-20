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

// POST /api/playlists
// body: { name, genre?, subgenre?, description?, visibility? ('private' optional) }
// router.post('/api/playlists', requireUser, async (req, res) => {
//   const db = await openDb();
//   const { name, genre, subgenre, description, visibility } = req.body;

//   if (!name?.trim()) return res.status(400).json({ error: "playlist_name required" });

//   const vis = (visibility && visibility !== 'public') ? visibility : 'private';

//   const sql = `
//     INSERT INTO playlists
//       (playlist_name, playlist_genre, playlist_subgenre, description,
//        user_id, created_at, is_seed, visibility)
//     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0, ?)
//   `;
//   try {
//     const result = await db.run(sql, [
//       name.trim(), genre ?? null, subgenre ?? null, description ?? null,
//       req.user.id, vis
//     ]);
//     const playlist_id = result.lastID;
//     const row = await db.get(`SELECT * FROM playlists WHERE playlist_id = ?`, [playlist_id]);
//     res.status(201).json(row);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });


export default router;
