# Spotify Explorer Lite

A lightweight React + Bootstrap web app that lets you search, browse, and
“favorite” tracks from the public **30 000 Spotify Songs** dataset.  
At this stage **everything is 100 % client-side**—no server, no database.  
Favorites and simple login state are persisted only in **`localStorage`** as a
placeholder until the back-end API is ready.

---

## ✨ Current Features
| Area | What works today |
|------|------------------|
| **Browse & search** | Track list (name + artist) with basic text filters. |
| **Favorites** | ♥ toggle on any song; favorites page lists saved items. |
| **Library nav** | Top navbar with dropdown links for Songs / Albums / Playlists (Albums & Playlists are stubs). |
| **Responsive UI** | React-Bootstrap cards & grid; looks fine from mobile to desktop. |
| **DIY Playlist** | Create, manage your own playlists |

---

## 🚧 Limitations (until we wire the back-end)

* **Login / Register** pages are placeholders—auth will arrive with the API.
* Favorites and playlists live in **`localStorage`** (`favriouteTracksIds`) and reset per browser.
* Only a subset of track metadata is shown; full details will come after MySQL
  integration.
* Albums page is empty shells for now.

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Front-end | React 18 + Vite |
| Styling | React-Bootstrap 2 / Bootstrap 5 |
| Routing | React Router v6 (`HashRouter`) |
| State mgmt | React Context (`TracksContext`) for track dataset |

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/CS571-SU25/p39.git

# 2. Install deps
npm install            # or yarn / pnpm
npm install axios

# 3. Run dev server
npm run dev            # Vite → http://localhost:5173/
```

## 📂 Key Directories
```bash
src/
 ├─ components/structural/   # Layout + navbar
 ├─ pages/                   # Route targets (Home, Songs, Favorites, etc.)
 ├─ contexts/TracksContext.js# Global track dataset (no favorites yet)
 ├─ data/tracks.json         # 200-row sample subset (for quick dev)
 └─ assets/                  # Logo, images
```

## 🗺 Roadmap
1. **Back-end API** — FastAPI or Flask + MySQL;
migrate favorites & auth off localStorage.

2. **Auth flow** — JWT login, register, logout.

3. **Album / Playlist views** — real joins once DB is in place.

4. **Pagination & advanced filtering** (energy, tempo, genre chips).

5. **Deploy** — Netlify/Render front-end, Railway for back-end.

## Quick note for backend developer
Here is how to get the db
```bash
cd backend
npm i sqlite3 csv-parse
node script/ingest-tracks.js
```
Then you should see .db files in `backend/sql`

Feel free to open issues or PRs—everything is work-in-progress!
