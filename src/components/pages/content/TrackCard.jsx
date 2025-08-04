import { Button, Card } from "react-bootstrap";

export default function TrackCard({ track, isFav, onFav }) {

  return (
    <Card className="shadow-sm h-100" style={{ width: "18rem", margin: "0.5rem" }}>
      <Card.Body className="d-flex flex-column gap-2">
        <Card.Title className="mb-0">{track.track_name}</Card.Title>
        <p className="mb-1 mt-1">Artist: {track.track_artist}</p>
        <p className="mb-1">Playlist Genre: {track.playlist_genre}</p>
        <p className="mb-1">Danceability: {track.danceability}</p>

        <Button
          variant={isFav ? "danger" : "outline-secondary"}
          className="me-2"
          size="sm"
          aria-pressed={isFav}
          onClick={() => onFav(track.track_id)}
        >
          {isFav ? "♥" : "♡"}
        </Button>
      </Card.Body>
    </Card>
  );
}