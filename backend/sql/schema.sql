PRAGMA foreign_keys = ON;

-- Optional: app users (auth placeholder)
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- ========== Core entities from dataset ==========
CREATE TABLE IF NOT EXISTS artists (
  artist_id   INTEGER PRIMARY KEY,
  artist_name TEXT NOT NULL UNIQUE
);

-- Use dataset album id as stable PK (CSV: track_album_id)
CREATE TABLE IF NOT EXISTS albums (
  album_id       TEXT PRIMARY KEY,          -- CSV: track_album_id
  album_name     TEXT NOT NULL,             -- CSV: track_album_name
  release_date   TEXT,                      -- CSV: track_album_release_date
  primary_artist INTEGER,                   -- first artist in list (optional)
  FOREIGN KEY (primary_artist) REFERENCES artists(artist_id) ON DELETE SET NULL
);

-- Use dataset track id as stable PK (CSV: track_id)
CREATE TABLE IF NOT EXISTS tracks (
  track_id           TEXT PRIMARY KEY,      -- CSV: track_id
  track_name         TEXT NOT NULL,         -- CSV: track_name
  track_popularity   INTEGER,               -- CSV: track_popularity
  album_id           TEXT NOT NULL,         -- CSV: track_album_id
  danceability       REAL,
  energy             REAL,
  key                INTEGER,
  loudness           REAL,
  mode               INTEGER,
  speechiness        REAL,
  acousticness       REAL,
  instrumentalness   REAL,
  liveness           REAL,
  valence            REAL,
  tempo              REAL,
  duration_ms        INTEGER,
  FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE RESTRICT
);

-- M:N track ↔ artist
CREATE TABLE IF NOT EXISTS track_artists (
  track_id  TEXT    NOT NULL,
  artist_id INTEGER NOT NULL,
  PRIMARY KEY (track_id, artist_id),
  FOREIGN KEY (track_id)  REFERENCES tracks(track_id)   ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

-- ========== Your app's user-created playlists (separate from dataset) ==========
CREATE TABLE IF NOT EXISTS playlists (
  playlist_id   TEXT PRIMARY KEY,
  playlist_name TEXT NOT NULL,
  description   TEXT,
  user_id       INTEGER,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
  playlist_id TEXT NOT NULL,
  track_id    TEXT NOT NULL,
  PRIMARY KEY (playlist_id, track_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE,
  FOREIGN KEY (track_id)    REFERENCES tracks(track_id)      ON DELETE CASCADE
);

-- ========== Dataset (seed) playlists from CSV ==========
CREATE TABLE IF NOT EXISTS seed_playlists (
  playlist_id      TEXT PRIMARY KEY,        -- CSV: playlist_id
  playlist_name    TEXT NOT NULL,           -- CSV: playlist_name
  playlist_genre   TEXT,
  playlist_subgenre TEXT
);

CREATE TABLE IF NOT EXISTS seed_playlist_tracks (
  playlist_id TEXT NOT NULL,
  track_id    TEXT NOT NULL,
  PRIMARY KEY (playlist_id, track_id),
  FOREIGN KEY (playlist_id) REFERENCES seed_playlists(playlist_id) ON DELETE CASCADE,
  FOREIGN KEY (track_id)    REFERENCES tracks(track_id)            ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_tracks_name    ON tracks(track_name);
CREATE INDEX IF NOT EXISTS idx_tracks_album   ON tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_albums_name    ON albums(album_name);
CREATE INDEX IF NOT EXISTS idx_albums_artist  ON albums(primary_artist);
CREATE INDEX IF NOT EXISTS idx_ta_artist      ON track_artists(artist_id);

-- Semantic views (aliases with nicer names)
CREATE VIEW IF NOT EXISTS perform (track_id, artist_id) AS
  SELECT track_id, artist_id FROM track_artists;

CREATE VIEW IF NOT EXISTS appear_in (playlist_id, track_id) AS
  SELECT playlist_id, track_id FROM seed_playlist_tracks;