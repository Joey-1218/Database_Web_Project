import { Link } from "react-router-dom";
import "./styles/playlist-tile.css";

// function getTrackCount(p) {
//   // Prefer explicit count if backend returns it
//   if (typeof p.track_count === "number") return p.track_count;

//   // Otherwise, try to infer from a tracks array / JSON string
//   try {
//     if (Array.isArray(p.tracks)) return p.tracks.length;
//     if (typeof p.tracks === "string" && p.tracks.trim()) {
//       const arr = JSON.parse(p.tracks);
//       return Array.isArray(arr) ? arr.length : undefined;
//     }
//   } catch {}
//   return undefined;
// }

export default function PlaylistCard({ playlist }) {
  const to = `/playlists/${playlist.playlist_id}`;
  const name = playlist.playlist_name ?? "(Untitled)";
  // const count = getTrackCount(playlist);
  const genre = playlist.playlist_genre ?? "(Unknown)";

  return (
    <Link to={to} className="playlist-tile text-reset text-decoration-none" aria-label={`Open ${name}`}>
      <div className="tile-text">
        <div className="tile-title">{name}</div>
        <div className="tile-subtitle">
          {genre}
        </div>
      </div>
    </Link>
  );
}
