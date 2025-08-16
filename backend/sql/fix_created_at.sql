
-- 1) Drop the blocker trigger
DROP TRIGGER IF EXISTS trg_playlists_no_update_seed;

-- 2) Do your fix (make seed playlists’ created_at NULL)
UPDATE playlists
SET created_at = NULL
WHERE is_seed = 1;

-- 3) Recreate the trigger (same text you had before)
CREATE TRIGGER IF NOT EXISTS trg_playlists_no_update_seed
BEFORE UPDATE ON playlists
FOR EACH ROW
WHEN OLD.is_seed = 1
BEGIN
  SELECT RAISE(ABORT, 'Cannot modify seed playlist');
END;

