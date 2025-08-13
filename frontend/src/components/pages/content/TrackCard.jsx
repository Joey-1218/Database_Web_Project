import { Button, Card, Dropdown } from "react-bootstrap";
import PlaylistContext from "../../contexts/PlaylistContext";
import { useContext } from "react";

export default function TrackCard({ track, isFav, onFav }) {

  const { playlists, addTrackTo } = useContext(PlaylistContext);

  return (
    <Card className="shadow-sm h-80" style={{ width: "22rem", margin: "0.5rem" }}>
      <Card.Body className="d-flex flex-column gap-2">
        <Card.Title className="mb-0">{track.track_name}</Card.Title>
        <p className="mb-1 mt-1">Artist: {track.artist_names}</p>
        <p className="mb-1">Album Name: {track.album_name}</p>
        <p className="mb-1">Popularity: {track.track_popularity}</p>

        <Button
          variant={isFav ? "danger" : "outline-secondary"}
          className="me-2"
          size="sm"
          aria-pressed={isFav}
          onClick={() => onFav(track.track_id)}
        >
          {isFav ? "♥" : "♡"}
        </Button>
        <Dropdown>
          <Dropdown.Toggle>Add to Playlist</Dropdown.Toggle>
          <Dropdown.Menu>
            {playlists.map(pl => (
              <Dropdown.Item key={pl.id} onClick={() => addTrackTo(pl.id, track.track_id)}>
                {pl.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Card.Body>
    </Card>
  );
}