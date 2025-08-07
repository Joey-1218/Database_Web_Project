import { useState } from "react";
import { Button, Card } from "react-bootstrap";

export default function FavCard({ track, onUnselect }) {

    return (
    <Card style={{ width: "100%", height: "14rem", margin: "0.5rem" }}>
      <Card.Body>
        <Card.Title>{track.track_name}</Card.Title>
        <p>Artist: {track.track_artist}</p>
        <p>Playlist Genre: {track.playlist_genre}</p>
        <p>Danceability: {track.danceability}</p>

        <Button
         variant="secondary" 
         className="me-2" 
         onClick={() => onUnselect(track.track_id)}
         >
           {"♥"}
        </Button>
      </Card.Body>
    </Card>
  );
}