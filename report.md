# Final Project Report — Spotify Explorer Lite



## Title of the Project

**Spotify Explorer Lite** — Search, browse, and manage music data with a modern full-stack web app.

## Name of the students

> Jinyi Ge, Hao Xiao

## Presentation video
> https://mediaspace.wisc.edu/media/Kaltura+Capture+recording+-+August+16th+2025%2C+8%3A50%3A33+am/1_hxhf1xql


---

## Introduction

### Motivation

We chose the music discovery domain because it’s familiar, data-rich, and user-centric. A Spotify-like explorer lets us practice real database modeling (artists–albums–tracks many-to-many), pagination/search at scale, and end-to-end full-stack auth—skills that transfer directly to production apps.

### Application overview

Spotify Explorer Lite is a React + Vite frontend backed by Node/Express and SQLite. Users can:

* Search and browse **tracks**, **albums**, and **playlists** (seed + user).
* View album/playlist detail pages (artists/tracks).
* **Register** and **log in** (bcrypt + JWT).
* Persist authenticated state on the client (localStorage + axios `Authorization`).

### Report organization & task assignment

* **All coding** — Jinyi Ge
* Hao Xiao never accepted github collaborator invitation until the end of semester.
* **Making slides** - Hao Xiao
* The only contribution to this project


---

## Our Implementation

### System architecture

* **Frontend**: React 18, Vite, React-Bootstrap. Axios client (`src/api.js`) reads `VITE_API_URL` or falls back to `/api`. Auth state `{ user, token }` stored in `localStorage`; axios default `Authorization: Bearer <token>` is set after login.
* **Backend**: Node 20, Express 4 (ESM). CORS allows `http://localhost:5173`. Routers:

  * `/api/tracks` (search + detail)
  * `/api/albums` (search + detail)
  * `/api/playlists` (search + detail; seed playlists read-only)
  * `/api/register` and `/api/login` (bcrypt + JWT)
* **Database**: SQLite file DB. Clean DB utility (`getDb()/all()/get()/run()`). Ingest script loads CSV, de-dupes, populates M\:N join tables, and seeds playlists. Migrations add seed flags/triggers and clear seed timestamps.

### Description of the dataset

* Source: public **30k Spotify Songs** CSV (tracks with audio features and popularity).
* We normalize into core entities (artists, albums, tracks) and M\:N bridges for artist participation.

### ER diagram (final)

![ER diagram](./ER%20diagram.png)

### Relational model (final)

```sql
-- Users
users(id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL);

-- Core music entities
artists(artist_id TEXT PRIMARY KEY, artist_name TEXT NOT NULL);
albums(album_id TEXT PRIMARY KEY, album_name TEXT NOT NULL, release_date TEXT);
tracks(track_id TEXT PRIMARY KEY, track_name TEXT NOT NULL,
       album_id TEXT NOT NULL REFERENCES albums(album_id),
       track_popularity INTEGER, danceability REAL, energy REAL, valence REAL, tempo REAL);

-- M:N bridges
track_artists(track_id TEXT NOT NULL REFERENCES tracks(track_id),
              artist_id TEXT NOT NULL REFERENCES artists(artist_id),
              PRIMARY KEY(track_id, artist_id));
album_artists(album_id TEXT NOT NULL REFERENCES albums(album_id),
              artist_id TEXT NOT NULL REFERENCES artists(artist_id),
              PRIMARY KEY(album_id, artist_id));

-- Playlists (seed + user)
playlists(playlist_id TEXT PRIMARY KEY,
          playlist_name TEXT NOT NULL,
          user_id INTEGER NULL REFERENCES users(id),
          is_seed INTEGER NOT NULL DEFAULT 0 CHECK(is_seed IN (0,1)),
          visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','public','unlisted')),
          created_at TEXT NULL);

playlist_tracks(playlist_id TEXT NOT NULL REFERENCES playlists(playlist_id),
                track_id TEXT NOT NULL REFERENCES tracks(track_id),
                PRIMARY KEY(playlist_id, track_id));

-- Views for readability
-- perform(track_id, artist_id) => track_artists
-- publish(album_id, artist_id) => album_artists
-- appear_in(playlist_id, track_id) => playlist_tracks

-- Triggers to protect seed playlists
-- - Block UPDATE/DELETE of seed playlists
-- - Block INSERT/DELETE of tracks in seed playlists
```

### Implementation: prototype description

**Frontend**

* **Pages**:

  * `SongBrowser`, `TrackInfoPage`
  * `AlbumsPage`, `AlbumInfoPage`
  * `PlaylistsPage`, `PlaylistInfoPage`
  * `LoginPage`, `RegisterPage`
* **Contexts**: `TracksContext`, `AlbumsContext`, `PlaylistsContext` (plural).
* **Auth UX**: On success, both Login and Register show a Bootstrap `Alert`, call `window.alert(...)`, persist `{ user, token }`, and set axios `Authorization`.

**Backend**

* **Tracks API**

  * `GET /api/tracks?q=&limit=&offset=` → `{ items, total, limit, offset }` sorted by popularity desc then name.
  * `GET /api/tracks/:id` → one row with audio features + album/artist names.
* **Albums API**

  * `GET /api/albums?album=&artist=&limit=&offset=` (case-insensitive).
  * `GET /api/albums/:id` → `{ album_id, album_name, release_date, artists[], tracks[] }` (frontend defensively parses JSON strings if needed).
* **Playlists API**

  * `GET /api/playlists?playlist=&owner=&limit=&offset=` → `{ items, total }` (each item may include `track_count` or `tracks`).
  * `GET /api/playlists/:id` → single playlist with tracks (standardized to an object).
* **Auth API**

  * `POST /api/register` → validates username/password, `bcrypt.hash`, inserts, returns `{ user, token }`.
  * `POST /api/login` → fetch user by username, `bcrypt.compare`, returns `{ user, token }`.
  * JWT includes `id` and `username`, signed with server secret; expiry configurable.

**Migrations & data ops**

* `scripts/ingest-tracks.js` — idempotent CSV import, fills M\:N tables, seeds playlists.
* `scripts/migrate.js` — runs schema/data migrations (seed flags; `created_at` null for seeds; trigger recreation).
* Dev utility: reset autoincrement via `DELETE FROM sqlite_sequence WHERE name='users'` after truncation.

### Evaluation

**API testing (curl & automated)**

* Sanity:

  * `GET /api/tracks?limit=5` → 200, exactly 5 items, `total` present, stable ordering.
  * `GET /api/albums?album=love` → 200, case-insensitive match across album/artist.
  * `GET /api/playlists?limit=5` → 200, item shape consistent (track\_count or tracks array).
  * Detail endpoints return 200 for existing ids, 404 (or 200 with empty) for missing.
* Auth:

  * Register: 201 with `{ user, token }`, unique constraint on `username`.
  * Login: 200 with `{ user, token }`, 400 for invalid credentials.
  * Token attached to subsequent requests via `Authorization` header.
* Data integrity:

  * Seed playlist triggers block UPDATE/DELETE and track mutations.
  * Foreign keys enforced; ingestion idempotent (re-run yields no duplicates).
* UI checks:

  * Loading/empty/error states; no double `/api` in requests; no CORS errors with dev origin.
  * “Load more” keeps grids mounted; buttons disable while loading to avoid blink.

---

## Conclusion

### What we learned

* **Schema design**: Modeling music domains requires careful M\:N handling; bridge tables plus views (`perform`, `publish`, `appear_in`) keep queries readable.
* **SQLite trade-offs**: Simple and fast for dev; watch out for migrations (no `IF NOT EXISTS` for `ADD COLUMN`), autoincrement sequences, and transaction scopes.
* **API ergonomics**: Clear pagination contracts (`total`, `limit`, `offset`) and stable ordering simplify frontend logic.
* **Auth**: Bcrypt + JWT is straightforward; the tricky parts are error hygiene, CORS, and consistent response shapes for the UI.
* **Frontend state**: Central axios instance with `VITE_API_URL`, plus setting default `Authorization`, made the app predictable across pages.

### Course connections

* **ER modeling & normalization** directly guided the relational schema and bridges.
* **Indexing & query planning**: We used pragmatic indexes (e.g., playlist flags/visibility) and discussed FTS5 as future work for LIKE search.
* **Transactions & triggers**: We leveraged triggers to enforce business rules (seed playlist immutability) at the DB layer.

---

## References

* Express, React, Vite, React-Bootstrap, Axios, bcryptjs, jsonwebtoken (official docs).
* Public “30k Spotify Songs” dataset (for development only).
* SQLite documentation (pragma, triggers, `RETURNING`, `sqlite_sequence`).

---

### Appendix (runbook highlights)

* **Backend**: `cd backend && npm i && npm run dev`
* **Frontend**: `cd frontend && npm i && npm run dev` with either:

  * `.env.local` → `VITE_API_URL=http://localhost:53705/api`, or
  * Vite proxy mapping `'/api'` → backend port
* **DB**: `node backend/scripts/ingest-tracks.js`; apply migrations via `scripts/migrate.js` or `sqlite3 < file.sql>`.


