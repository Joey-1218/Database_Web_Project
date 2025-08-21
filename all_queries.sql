SELECT COUNT(DISTINCT ab.album_id) AS total FROM albums ab LEFT JOIN publish p ON p.album_id = ab.album_id LEFT JOIN artists at ON p.artist_id = at.artist_id WHERE ...;

SELECT
        ab.album_id,
        ab.album_name,
        ab.release_date,
        GROUP_CONCAT(DISTINCT at.artist_name) AS artist_names
    FROM albums ab
    LEFT JOIN publish p ON p.album_id = ab.album_id
    LEFT JOIN artists at ON p.artist_id = at.artist_id
    WHERE ...
    GROUP BY ab.album_id
    ORDER BY (ab.release_date IS NULL), ab.release_date DESC, ab.album_name ASC
    LIMIT ? OFFSET ?;

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

SELECT 1 FROM playlists WHERE playlist_id = ?

SELECT COUNT(DISTINCT p.playlist_id) AS total FROM playlists p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN appear_in a ON p.playlist_id = a.playlist_id LEFT JOIN tracks t ON t.track_id = a.track_id WHERE ...;

SELECT
      p.*
    FROM playlists p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN appear_in a ON p.playlist_id = a.playlist_id
    LEFT JOIN tracks t ON t.track_id = a.track_id
    WHERE ...
    GROUP BY p.playlist_id
    ORDER BY p.is_seed ASC, COALESCE(p.created_at, '0000-00-00 00:00:00') DESC, p.playlist_name COLLATE NOCASE ASC
    LIMIT ? OFFSET ?;

SELECT
      p.*,
      json_group_array(
        json_object(
          'track_id', t.track_id,
          'track_name', t.track_name
        )
      ) AS tracks
    FROM playlists p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN appear_in a ON p.playlist_id = a.playlist_id
    LEFT JOIN tracks t ON t.track_id = a.track_id
    WHERE p.playlist_id = ?
    GROUP BY p.playlist_id;

INSERT INTO playlists
      (playlist_id, playlist_name, playlist_genre, playlist_subgenre, description,
       user_id, created_at, is_seed, visibility)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0, ?);

SELECT * FROM playlists WHERE playlist_id = ?;

INSERT OR IGNORE INTO appear_in (playlist_id, track_id) VALUES (?, ?);

DELETE FROM appear_in WHERE playlist_id = ? AND track_id = ?;

DELETE FROM appear_in WHERE playlist_id = ?;

DELETE FROM playlists WHERE playlist_id = ?;

SELECT COUNT(DISTINCT t.track_id) AS total FROM tracks t LEFT JOIN albums al ON al.album_id = t.album_id LEFT JOIN perform p ON p.track_id = t.track_id LEFT JOIN artists a ON a.artist_id = p.artist_id WHERE ...;

SELECT
      t.*,
      al.album_name,
      al.release_date,
      json_group_array(
        json_object(
          'artist_id', a.artist_id,
          'artist_name', a.artist_name
        )
      ) AS artists
    FROM tracks t
    LEFT JOIN albums  al ON al.album_id = t.album_id
    LEFT JOIN perform p  ON p.track_id  = t.track_id
    LEFT JOIN artists a  ON a.artist_id = p.artist_id
    WHERE ...
    GROUP BY t.track_id
    ORDER BY ...;

SELECT
      t.*,
      al.album_name,
      al.release_date,
      json_group_array(
        json_object('artist_id', a.artist_id, 'artist_name', a.artist_name)
      ) AS artists
    FROM tracks t
    LEFT JOIN albums  al ON al.album_id = t.album_id
    LEFT JOIN perform p  ON p.track_id  = t.track_id
    LEFT JOIN artists a  ON a.artist_id = p.artist_id
    WHERE t.track_id = ?
    GROUP BY t.track_id;

SELECT * FROM users WHERE username = ?

SELECT id FROM users WHERE username = ?

INSERT INTO users (username, password_hash) VALUES (?, ?)

