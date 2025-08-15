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
 *   album?      - search (matches album_name; case-insensitive)
 *   artist?     - search (matches artist_name; case-insensitive)
 *   limit?  - default 20, max 100
 *   offset? - default 0
 * Returns: { items, total, limit, offset }
 */
router.get('/', async (req, res, next) => {
    try {
        const limit = clampInt(req.query.limit, { def: 20, min: 1, max: 100 });
        const offset = clampInt(req.query.offset, { def: 0, min: 0, max: 22545 });

        const album = (req.query.album ?? '').trim();
        const artist = (req.query.artist ?? '').trim();

        const FROM = `
            FROM albums ab
            LEFT JOIN publish p ON p.album_id = ab.album_id
            LEFT JOIN artists at ON p.artist_id = at.artist_id
        `;

        const conds = [];
        const params = [];

        if (album) {
            conds.push('ab.album_name LIKE ? COLLATE NOCASE');
            params.push(`%${album}%`);
        }
        if (artist) {
            conds.push('at.artist_name LIKE ? COLLATE NOCASE');
            params.push(`%${artist}%`);
        }

        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

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
 * GET /api/albums/:id
 * Returns one album row plus aggregated artist names and track info.
 */
router.get('/:id', async (req, res, next) => {
    try {
        const row = await get(
            `
            WITH tracks_agg AS (
                SELECT
                    t.album_id,
                    json_group_array(
                    json_object('track_id', t.track_id, 'track_name', t.track_name)
                    ) AS tracks
                FROM tracks t
                WHERE t.album_id = ?1
                GROUP BY t.album_id
            ),
            artists_agg AS (
                SELECT
                    p.album_id,
                    json_group_array(
                    json_object('artist_id', at.artist_id, 'artist_name', at.artist_name)
                    ) AS artists
                FROM publish p
                JOIN artists at ON at.artist_id = p.artist_id
                WHERE p.album_id = ?1
                GROUP BY p.album_id
            )
            SELECT
                al.*,
                COALESCE(artists_agg.artists, json('[]')) AS artists,
                COALESCE(tracks_agg.tracks,  json('[]')) AS tracks
            FROM albums al
            LEFT JOIN tracks_agg  ON tracks_agg.album_id  = al.album_id
            LEFT JOIN artists_agg ON artists_agg.album_id = al.album_id
            WHERE al.album_id = ?1;
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
