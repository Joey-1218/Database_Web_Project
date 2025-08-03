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
git clone https://github.com/<your-org>/spotify-explorer-lite.git
cd spotify-explorer-lite

# 2. Install deps
npm install            # or yarn / pnpm

# 3. Run dev server
npm run dev            # Vite → http://localhost:5173/
