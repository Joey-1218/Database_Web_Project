// backend/src/routes/tracks.js
import express from 'express';
import { all, get } from '../db.js';

const router = express.Router();

// small helpers
function clampInt(value, { def, min, max }) {
  const n = Number.parseInt(value ?? def, 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/**
 * GET /api/tracks
 * Query:
 *   q?      - search (matches track_name, artist_name, album_name; case-insensitive)
 *   limit?  - default 20, max 100
 *   offset? - default 0
 * Returns: { items, total, limit, offset }
 */
router.get('/', async (req, res, next) => {
  try {
    const limit  = clampInt(req.query.limit,  { def: 20, min: 1,  max: 28356 });
    const offset = clampInt(req.query.offset, { def: 0,  min: 0,  max: 28356 });

    const track  = (req.query.track  ?? '').trim();
    const artist = (req.query.artist ?? '').trim();
    
    // const trackLike = `%${track}%`;
    // const artistLike = `%${artist}%`

    const FROM = `
      FROM tracks t
      LEFT JOIN albums  al ON al.album_id = t.album_id
      LEFT JOIN perform p  ON p.track_id  = t.track_id
      LEFT JOIN artists a  ON a.artist_id = p.artist_id
    `;
    //JOIN playlist_tracks in the future

    const conds = [];
    const params = [];

    if (track) {
      conds.push('t.track_name LIKE ? COLLATE NOCASE');
      params.push(`%${track}%`);
    }
    if (artist) {
      conds.push('a.artist_name LIKE ? COLLATE NOCASE');
      params.push(`%${artist}%`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    // total
    const totalRow = await get(
      `SELECT COUNT(DISTINCT t.track_id) AS total ${FROM} ${where};`,
      params
    );

    // page of items
    const items = await all(
      `
      SELECT
        t.track_id,
        t.track_name,
        t.track_popularity,
        t.album_id,
        al.album_name,
        al.release_date,
        -- a few audio features your UI already shows
        t.danceability, t.energy, t.valence, t.tempo,
        GROUP_CONCAT(DISTINCT a.artist_name) AS artist_names
      ${FROM}
      ${where}
      GROUP BY t.track_id
      -- nulls last, then name for stable order
      ORDER BY (t.track_popularity IS NULL), t.track_popularity DESC, t.track_name ASC
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
 * GET /api/tracks/:id
 * Returns one track row plus aggregated artist names and album info.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const row = await get(
      `
      SELECT
        t.*,
        al.album_name,
        al.release_date,
        GROUP_CONCAT(DISTINCT a.artist_name) AS artist_names
      FROM tracks t
      LEFT JOIN albums  al ON al.album_id = t.album_id
      LEFT JOIN perform p  ON p.track_id  = t.track_id
      LEFT JOIN artists a  ON a.artist_id = p.artist_id
      WHERE t.track_id = ?
      GROUP BY t.track_id;
      `,
      [req.params.id]
    );

    if (!row) return res.status(404).json({ error: 'Track not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
