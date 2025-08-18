# Spotify Explorer Lite

A lightweight React + Vite app with a Node/Express + SQLite backend.
Browse/search tracks, albums, and playlists from the **30k Spotify Songs** dataset.
Favorites remain client-side for now; playlists are moving toward server-backed.

---

## ✨ What works now

* **Tracks**

  * Browse/search (q, limit, offset), detail page with audio features.
* **Albums**

  * Browse/search by album/artist, detail page shows artists + tracks.
* **Playlists**

  * Browse/search by name (owner optional), detail page lists tracks.
  * Seed playlists are **read-only** (enforced via trigger).
* **UI/UX**

  * React-Bootstrap layout, responsive grid, theme toggle, accessible links.

---

## 🧱 Architecture

```
backend/
  sql/
    schema.sql               # tables, FKs, views (perform/publish/appear_in)
  scripts/
    ingest-tracks.js         # CSV -> sqlite db, idempotent
    migrate.js               # apply SQL migrations (ESM)
  src/
    db.js                    # sqlite singleton (getDb/all/get/run)
    server.js                # Express app, CORS, JSON, mount routers
    routes/
      tracks.js              # GET /api/tracks, GET /api/tracks/:id
      albums.js              # GET /api/albums, GET /api/albums/:id
      playlists.js           # GET /api/playlists, GET /api/playlists/:id

frontend/
  src/
    api.js                   # axios instance; baseURL from VITE_API_URL
    components/
      contexts/
        TracksContext.jsx
        AlbumsContext.jsx
        PlaylistsContext.jsx   # (plural) provider for playlist listing
      pages/
        SongBrowser.jsx
        TrackInfoPage.jsx
        AlbumsPage.jsx
        AlbumInfoPage.jsx
        PlaylistsPage.jsx
        PlaylistInfoPage.jsx
        pages/styles/
          AlbumInfoPage.css, 
          PlaylistInfoPage.css
      content/
        AlbumCard.jsx, PlaylistCard.jsx, ...
        AlbumSearchSidebar.jsx, PlaylistSearchSidebar.jsx
      structural/
        SpotifyLayout.jsx, Navbar, etc.
    
    components/content/styles/
      album-tile.css, playlist-tile.css
```

---

## 🚀 Getting started (dev)

> Requires **Node 20+**.

```bash
# 0) From repo root
git clone <repo> && cd <repo>

# 1) Build the SQLite DB from CSV
#    Place spotify_songs.csv under backend/data/ if not already present
node backend/script/ingest-tracks.js
node backend/script/migrate.js

# 2) Start the API (http://localhost:53705)
cd backend
npm install
npm run dev

# 3) Start the frontend (http://localhost:5173)
cd ../frontend
npm install
# Option A: direct API URL
echo "VITE_API_URL=http://localhost:53705/api" > .env.local
npm run dev

# Option B: Vite proxy (frontend -> backend)
#  - vite.config.* should proxy '/api' -> 'http://localhost:53705'
#  - set VITE_API_URL=/api  (or leave default '/api' in api.js)
```

---

## 🔌 Configuration

### Frontend

* **`src/api.js`** picks baseURL from:

  * `VITE_API_URL` (e.g., `http://localhost:53705/api` or `/api`)
  * Falls back to `'/api'` (works with Vite proxy)
* Install axios in **frontend**:

  ```bash
  cd frontend && npm i axios
  ```

### Backend

* **Port**: defaults to `53705`.
* **CORS**: allow origin `http://localhost:5173` for Vite dev.
* **ESM**: `"type": "module"`; include **`.js` extensions** in imports.

---

## 🗄️ Data model (high level)

* Entities: `artists`, `albums`, `tracks`
* M\:N joins: `track_artists`, `album_artists`
* Playlists:

  * `playlists` (seed + user), `playlist_tracks`
  * Views:

    * `perform(track_id, artist_id)` → `track_artists`
    * `publish(album_id, artist_id)` → `album_artists`
    * `appear_in(playlist_id, track_id)` → `playlist_tracks`
* Trigger prevents modifying **seed** playlists.

---

## 📡 API (today)

### Tracks

* `GET /api/tracks?q=&limit=&offset=`
  Returns `{ items, total, limit, offset }`
  Each item includes: `track_id`, `track_name`, `track_popularity`, `album_id`, `album_name`, `release_date`, audio feature fields, `artist_names`.
* `GET /api/tracks/:id`
  One object with full details.

### Albums

* `GET /api/albums?album=&artist=&limit=&offset=`

  * Search by album or artist name (case-insensitive).
* `GET /api/albums/:id`

  * Returns `{ album_id, album_name, release_date, artists, tracks }`
  * `artists`/`tracks` are arrays; if serialized as JSON strings, frontend guards parse.

### Playlists

* `GET /api/playlists?playlist=&owner=&limit=&offset=`

  * Returns `{ items, total, limit, offset }`
  * Each item may include `track_count` **or** `tracks` array/JSON.
* `GET /api/playlists/:id`

  * Returns one playlist object with `tracks` (array or JSON string).
  * Seed playlists have `is_seed = 1`; `created_at` may be `NULL`.

> Note: Some backends return an **array** for detail routes; the frontend normalizes:

```js
const record = Array.isArray(data) ? data[0] : data;
```

---

## 🧭 Usage tips (frontend)

* **Providers**

  * Use **`PlaylistsProvider`** (plural). Avoid mixing with any older `PlaylistContext` used for favorites.
* **Pagination**

  * Albums & Playlists pages use a “grow by limit” pattern (`limit += PAGE_SIZE`).
  * To avoid UI “blink” on Load More, keep grids mounted while `isLoading` is true; disable the button and change its label to “Loading…”.
* **Detail pages**

  * Defensive parsing for `artists`/`tracks` when backend returns JSON strings.

---

## 🧪 Quick checks

```bash
# API sanity
curl "http://localhost:53705/api/tracks?limit=1"
curl "http://localhost:53705/api/albums?limit=1"
curl "http://localhost:53705/api/playlists?limit=1"

# Detail (replace IDs)
curl "http://localhost:53705/api/tracks/<id>"
curl "http://localhost:53705/api/albums/<id>"
curl "http://localhost:53705/api/playlists/<id>"
```

Expected: HTTP 200 with JSON payloads including `total`, `items`, and stable ordering (e.g., popularity desc then name).

---

## 🗺 Roadmap

1. **Playlists CRUD API** (`POST/DELETE`, add/remove track endpoints) and wire UI.
2. **Favorites server-side** (replace `localStorage` with user-scoped table).
3. **Auth** (JWT/bcrypt) and connect `playlists.user_id`.
4. **Search polish** (debounce, URL params, loading/empty states).
5. **Perf** (indexes; optional FTS5 for full-text search).

