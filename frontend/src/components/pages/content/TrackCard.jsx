import { Button, Card, Dropdown } from "react-bootstrap";
import PlaylistContext from "../../contexts/PlaylistsContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import "./styles/track-tile.css"; // styles below

export default function TrackCard({ track }) {

  // This should be modified later...
  // const { playlists, addTrackTo } = useContext(PlaylistContext);

  const to = `/songs/${track.track_id}`;
  let artists = [];
  try {
    artists = track.artists ? JSON.parse(track.artists) : [];
  } catch {
    artists = [];
  }

  const subtitle =
    artists.length > 0
      ? artists
        .map((artist) => artist.artist_name || "(Unknown Artist)")
        .join(", ")
      : "(No Artist Info)";

  return (
    <Link to={to} className="track-tile text-reset text-decoration-none" aria-label={`Open ${track.track_name}`}>
      <div className="tile-text">
        <div className="tile-title">{track.track_name ?? "(Untitled)"}</div>
        <div className="tile-subtitle">{subtitle}</div>
      </div>
    </Link>
  );
}