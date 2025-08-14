import { Button, Card, Dropdown } from "react-bootstrap";
import PlaylistContext from "../../contexts/PlaylistContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import "./track-tile.css"; // styles below

export default function TrackCard({ track }) {

  // This should be modified later...
  // const { playlists, addTrackTo } = useContext(PlaylistContext);

  const to = `/songs/${track.track_id}`;
  return (
    <Link to={to} className="track-tile text-reset text-decoration-none" aria-label={`Open ${track.track_name}`}>
      <div className="tile-text">
        <div className="tile-title">{track.track_name ?? "(Untitled)"}</div>
        <div className="tile-subtitle">{track.artist_names ?? "(Unknown artist)"}</div>
      </div>
    </Link>
  );
}