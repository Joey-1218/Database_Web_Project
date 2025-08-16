-- Add columns (idempotent: only run if the column doesn't exist)
-- SQLite can't do IF NOT EXISTS for columns, so re-running this file must be controlled by your runner.
ALTER TABLE playlists
ADD COLUMN is_seed INTEGER NOT NULL DEFAULT 0 CHECK (is_seed IN (0, 1));

ALTER TABLE playlists
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted'));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_playlists_owner ON playlists (user_id);

CREATE INDEX IF NOT EXISTS idx_playlists_visibility ON playlists (visibility);

CREATE INDEX IF NOT EXISTS idx_playlists_seed ON playlists (is_seed);

-- Mark existing seed playlists (adjust the WHERE to match your dataset)
-- If all existing rows are seed playlists:
UPDATE playlists
SET
    is_seed = 1,
    visibility = 'public'
WHERE
    user_id IS NULL;

-- OPTIONAL: protect seed playlists at the DB level
-- Block DELETE of seed playlists
CREATE TRIGGER IF NOT EXISTS trg_playlists_no_delete_seed BEFORE DELETE ON playlists FOR EACH ROW WHEN OLD.is_seed = 1 BEGIN
SELECT
    RAISE (ABORT, 'Cannot delete seed playlist');

END;

-- Block UPDATE of seed playlists (except you may allow visibility updates—remove that column if needed)
CREATE TRIGGER IF NOT EXISTS trg_playlists_no_update_seed BEFORE
UPDATE ON playlists FOR EACH ROW WHEN OLD.is_seed = 1 BEGIN
SELECT
    RAISE (ABORT, 'Cannot modify seed playlist');

END;

-- Also stop removing tracks from seed playlists
CREATE TRIGGER IF NOT EXISTS trg_playlist_tracks_no_delete_seed BEFORE DELETE ON playlist_tracks FOR EACH ROW WHEN (
    SELECT
        is_seed
    FROM
        playlists
    WHERE
        playlist_id = OLD.playlist_id
) = 1 BEGIN
SELECT
    RAISE (ABORT, 'Cannot modify seed playlist tracks');

END;

-- And inserting into seed playlists
CREATE TRIGGER IF NOT EXISTS trg_playlist_tracks_no_insert_seed BEFORE INSERT ON playlist_tracks FOR EACH ROW WHEN (
    SELECT
        is_seed
    FROM
        playlists
    WHERE
        playlist_id = NEW.playlist_id
) = 1 BEGIN
SELECT
    RAISE (ABORT, 'Cannot modify seed playlist tracks');

END;