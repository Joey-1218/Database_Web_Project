import PlaylistContext from "../../contexts/PlaylistsContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import "./styles/album-tile.css"; // styles below

export default function AlbumCard({ album }) {

  // This should be modified later...
  // const { playlists, addTrackTo } = useContext(PlaylistContext);

  const to = `/albums/${album.album_id}`;
  return (
    <Link to={to} className="album-tile text-reset text-decoration-none" aria-label={`Open ${album.album_name}`}>
      <div className="tile-text">
        <div className="tile-title">{album.album_name ?? "(Untitled)"}</div>
        <div className="tile-subtitle">{album.artist_names ?? "(Unknown artist)"}</div>
      </div>
    </Link>
  );
}