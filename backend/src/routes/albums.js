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
 * GET /api/albums
 * Query:
 *   q?      - search (matches album_name, artist_name; case-insensitive)
 *   limit?  - default 20, max 100
 *   offset? - default 0
 * Returns: { items, total, limit, offset }
 */
router.get('/', async (req, res, next) => {
    try {
        const limit = clampInt(req.query.limit, { def: 20, min: 1, max: 100 });
        const offset = clampInt(req.query.offset, { def: 0, min: 0, max: 22545 });

        const q = (req.query.q ?? '').trim();
        const qLike = `%${q}%`;

        const FROM = `
      FROM albums ab
      LEFT JOIN publish p ON p.album_id = ab.album_id
      LEFT JOIN artists at ON p.artist_id = at.artist_id
    `;

        const where = q
            ? `WHERE ab.album_name LIKE ? COLLATE NOCASE
             OR at.artist_name LIKE ? COLLATE NOCASE`
            : '';

        const params = q ? [qLike, qLike] : [];

        // total
        const totalRow = await get(
            `SELECT COUNT(DISTINCT ab.album_id) AS total ${FROM} ${where};`,
            params
        );

        // page of items
        const items = await all(
            `
            SELECT
            ab.album_id,
            ab.album_name,
            ab.release_date,
            GROUP_CONCAT(DISTINCT at.artist_name) AS artist_names
            ${FROM}
            ${where}
            GROUP BY ab.album_id
            ORDER BY (ab.release_date IS NULL), ab.release_date DESC, ab.album_name ASC
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
