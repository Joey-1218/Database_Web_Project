// Usage:
//   node scripts/ingest-tracks.js
//   node scripts/ingest-tracks.js /absolute/or/relative/path/to/spotify_songs.csv
//
// What it does (idempotent):
// - Applies backend/sql/schema.sql
// - Loads artists, albums, tracks from CSV (deduped & upserted)
// - Loads dataset playlists into seed_playlists + seed_playlist_tracks
//
// Safety:
// - Keeps higher track_popularity across duplicates
// - Never overwrites existing non-null values with nulls
// - Skips broken rows missing essential IDs
// - Works in ESM projects ("type": "module")

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';

sqlite3.verbose();

// Resolve paths relative to this script, not the CWD.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');

// Candidate CSV locations: CLI arg, backend/data/, repo root
const argPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
const tryPaths = [
  argPath,
  path.resolve(backendDir, 'data', 'spotify_songs.csv'),
  path.resolve(backendDir, '..', 'spotify_songs.csv'),
].filter(Boolean);

const csvPath = tryPaths.find(p => fs.existsSync(p));
if (!csvPath) {
  console.error('Could not find spotify_songs.csv. Pass a path or place it in backend/data/ or repo root.');
  process.exit(1);
}

const dbPath = path.resolve(backendDir, 'sql', 'spotify.db');
const schemaPath = path.resolve(backendDir, 'sql', 'schema.sql');

// --- small helpers ---
function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, err => (err ? reject(err) : resolve(db)));
  });
}
function exec(db, sql) {
  return new Promise((resolve, reject) => db.exec(sql, err => (err ? reject(err) : resolve())));
}
function prepare(db, sql) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql, err => (err ? reject(err) : resolve(stmt)));
  });
}
function runStmt(stmt, params) {
  return new Promise((resolve, reject) => {
    stmt.run(params, function (err) {
      if (err) reject(err); else resolve(this);
    });
  });
}
function getRow(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function toInt(x) {
  if (x === undefined || x === null || x === '') return null;
  const v = parseInt(x, 10);
  return Number.isFinite(v) ? v : null;
}
function toFloat(x) {
  if (x === undefined || x === null || x === '') return null;
  const v = parseFloat(x);
  return Number.isFinite(v) ? v : null;
}

(async () => {
  const db = await openDb();

  // Pragmas: fast + safe for bulk import
  await exec(db, `
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
  `);

  // Apply schema
  const schema = await fsp.readFile(schemaPath, 'utf8');
  await exec(db, 'BEGIN IMMEDIATE;');
  await exec(db, schema);
  await exec(db, 'COMMIT;');

  // Prepared statements
  const insArtist = await prepare(db, `
    INSERT INTO artists(artist_name)
    VALUES (?)
    ON CONFLICT(artist_name) DO NOTHING;
  `);
  const selArtist = `SELECT artist_id FROM artists WHERE artist_name = ?;`;

  // Album: never clobber good data with NULL; keep existing primary_artist if set.
  const insAlbum = await prepare(db, `
    INSERT INTO albums(album_id, album_name, release_date, primary_artist)
    VALUES (?,?,?,?)
    ON CONFLICT(album_id) DO UPDATE SET
      album_name     = COALESCE(excluded.album_name, albums.album_name),
      release_date   = COALESCE(excluded.release_date, albums.release_date),
      primary_artist = COALESCE(albums.primary_artist, excluded.primary_artist);
  `);

  // Track: keep higher popularity; never overwrite non-null with null; prefer stable album_id.
  const insTrack = await prepare(db, `
    INSERT INTO tracks(
      track_id, track_name, track_popularity, album_id,
      danceability, energy, key, loudness, mode, speechiness,
      acousticness, instrumentalness, liveness, valence, tempo, duration_ms
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(track_id) DO UPDATE SET
      track_name       = COALESCE(excluded.track_name, tracks.track_name),
      track_popularity = CASE
                           WHEN excluded.track_popularity IS NOT NULL
                                AND (tracks.track_popularity IS NULL
                                     OR excluded.track_popularity > tracks.track_popularity)
                           THEN excluded.track_popularity
                           ELSE tracks.track_popularity
                         END,
      album_id         = COALESCE(tracks.album_id, excluded.album_id),
      danceability     = COALESCE(excluded.danceability,     tracks.danceability),
      energy           = COALESCE(excluded.energy,           tracks.energy),
      key              = COALESCE(excluded.key,              tracks.key),
      loudness         = COALESCE(excluded.loudness,         tracks.loudness),
      mode             = COALESCE(excluded.mode,             tracks.mode),
      speechiness      = COALESCE(excluded.speechiness,      tracks.speechiness),
      acousticness     = COALESCE(excluded.acousticness,     tracks.acousticness),
      instrumentalness = COALESCE(excluded.instrumentalness, tracks.instrumentalness),
      liveness         = COALESCE(excluded.liveness,         tracks.liveness),
      valence          = COALESCE(excluded.valence,          tracks.valence),
      tempo            = COALESCE(excluded.tempo,            tracks.tempo),
      duration_ms      = COALESCE(excluded.duration_ms,      tracks.duration_ms);
  `);

  const insTA = await prepare(db, `
    INSERT INTO track_artists(track_id, artist_id)
    VALUES(?,?)
    ON CONFLICT(track_id, artist_id) DO NOTHING;
  `);

  const insSeedPl = await prepare(db, `
    INSERT INTO seed_playlists(playlist_id, playlist_name, playlist_genre, playlist_subgenre)
    VALUES(?,?,?,?)
    ON CONFLICT(playlist_id) DO UPDATE SET
      playlist_name     = COALESCE(excluded.playlist_name,    seed_playlists.playlist_name),
      playlist_genre    = COALESCE(excluded.playlist_genre,   seed_playlists.playlist_genre),
      playlist_subgenre = COALESCE(excluded.playlist_subgenre,seed_playlists.playlist_subgenre);
  `);

  const insSeedPlTrack = await prepare(db, `
    INSERT INTO seed_playlist_tracks(playlist_id, track_id)
    VALUES(?,?)
    ON CONFLICT(playlist_id, track_id) DO NOTHING;
  `);

  // CSV stream
  const parser = fs.createReadStream(csvPath).pipe(parse({ columns: true, trim: true }));

  let n = 0;
  await exec(db, 'BEGIN IMMEDIATE;');

  for await (const r of parser) {
    // Exact CSV columns:
    // track_id, track_name, track_artist, track_popularity,
    // track_album_id, track_album_name, track_album_release_date,
    // playlist_name, playlist_id, playlist_genre, playlist_subgenre,
    // danceability, energy, key, loudness, mode, speechiness,
    // acousticness, instrumentalness, liveness, valence, tempo, duration_ms

    const track_id = (r.track_id || '').trim();
    const track_name = (r.track_name || '').trim();
    const track_popularity = toInt(r.track_popularity);

    const album_id = (r.track_album_id || '').trim();
    const album_name = (r.track_album_name || '').trim();
    const release_date = ((r.track_album_release_date || '').trim()) || null;

    if (!track_id || !track_name || !album_id) {
      // skip rows missing essential IDs
      continue;
    }

    // Artists: split by comma/semicolon
    const artistNames = (r.track_artist || '')
      .split(/[;,]/)
      .map(s => s.trim())
      .filter(Boolean);

    const primaryArtistName = artistNames[0] || null;

    // Upsert primary artist
    let primaryArtistId = null;
    if (primaryArtistName) {
      await runStmt(insArtist, [primaryArtistName]);
      const row = await getRow(db, selArtist, [primaryArtistName]);
      primaryArtistId = row ? row.artist_id : null;
    }

    // Upsert album (dataset's album_id is the PK)
    await runStmt(insAlbum, [
      album_id,
      album_name || '(Unknown Album)',
      release_date,
      primaryArtistId
    ]);

    // Upsert track with robust conflict rules
    await runStmt(insTrack, [
      track_id, track_name, track_popularity, album_id,
      toFloat(r.danceability), toFloat(r.energy), toInt(r.key), toFloat(r.loudness), toInt(r.mode),
      toFloat(r.speechiness), toFloat(r.acousticness), toFloat(r.instrumentalness), toFloat(r.liveness),
      toFloat(r.valence), toFloat(r.tempo), toInt(r.duration_ms)
    ]);

    // Upsert all contributing artists + link to track
    for (const name of artistNames) {
      await runStmt(insArtist, [name]);
      const a = await getRow(db, selArtist, [name]);
      if (a?.artist_id) {
        await runStmt(insTA, [track_id, a.artist_id]);
      }
    }

    // Seed playlists linkage
    const pid = (r.playlist_id || '').trim();
    if (pid) {
      await runStmt(insSeedPl, [
        pid,
        (r.playlist_name || '').trim() || '(Unknown Playlist)',
        (r.playlist_genre || '').trim() || null,
        (r.playlist_subgenre || '').trim() || null
      ]);
      await runStmt(insSeedPlTrack, [pid, track_id]);
    }

    if (++n % 2000 === 0) {
      console.log(`Imported ${n} rows...`);
    }
  }

  await exec(db, 'COMMIT;');

  // finalize prepared statements
  for (const stmt of [insArtist, insAlbum, insTrack, insTA, insSeedPl, insSeedPlTrack]) {
    try { stmt.finalize(); } catch {}
  }

  console.log(`Done. Imported ~${n} CSV rows from ${csvPath}`);
  db.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
