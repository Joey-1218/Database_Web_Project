import React, { useContext, useMemo, useRef, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  ListGroup,
  Stack,
} from "react-bootstrap";
import PlaylistContext from "../contexts/PlaylistContext";
import TracksContext from "../contexts/TracksContext";

export default function PlaylistPage() {
  const { playlists, addPlaylist, deletePlaylist, removeTrackFrom } =
    useContext(PlaylistContext);
  const { allTracks } = useContext(TracksContext);

  // Build a quick lookup so we can render track names from IDs efficiently
  const trackMap = useMemo(() => {
    const m = new Map();
    allTracks.forEach((t) => m.set(t.track_id, t));
    return m;
  }, [allTracks]);

  // Create form (uncontrolled for simplicity)
  const nameRef = useRef(null);
  const descRef = useRef(null);
  const [validated, setValidated] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }
    const name = nameRef.current.value.trim();
    const desc = descRef.current.value.trim();
    if (name) {
      addPlaylist(name, desc);
      form.reset();
      setValidated(false);
    }
  };

  const handleDeletePlaylist = (plId) => {
    if (confirm("Delete this playlist? This cannot be undone.")) {
      deletePlaylist(plId);
    }
  };

  const handleRemoveTrack = (plId, trackId) => {
    removeTrackFrom(plId, trackId);
  };

  return (
    <section>
      <h2 className="mb-3">Your Playlists</h2>

      {/* Create New Playlist */}
      <Card className="p-3 mb-4">
        <Form noValidate validated={validated} onSubmit={handleCreate}>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Group controlId="plName">
                <Form.Label>Playlist Name</Form.Label>
                <Form.Control
                  ref={nameRef}
                  placeholder="e.g., Gym Pump"
                  required
                  aria-label="Playlist name"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="plDesc">
                <Form.Label>Description (optional)</Form.Label>
                <Form.Control
                  ref={descRef}
                  placeholder="Short description"
                  aria-label="Playlist description"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button type="submit" className="w-100">
                Create
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Existing Playlists */}
      {playlists.length === 0 ? (
        <p>No playlists yet. Create one using the form above, then add tracks from the Songs page.</p>
      ) : (
        <Row className="g-3">
          {playlists.map((pl) => (
            <Col key={pl.id} xs={12} md={6} lg={4}>
              <Card className="h-100">
                <Card.Body>
                  <Stack direction="horizontal" gap={2} className="mb-2">
                    <Card.Title className="mb-0">{pl.name}</Card.Title>
                    <Badge bg="secondary" className="ms-auto">
                      {pl.trackIds.length} track{pl.trackIds.length === 1 ? "" : "s"}
                    </Badge>
                  </Stack>
                  {pl.desc && (
                    <Card.Subtitle className="text-muted mb-3">
                      {pl.desc}
                    </Card.Subtitle>
                  )}

                  {pl.trackIds.length === 0 ? (
                    <p className="text-muted">No tracks yet. Use “Add to Playlist” on any song.</p>
                  ) : (
                    <ListGroup variant="flush" style={{ maxHeight: 260, overflow: "auto" }}>
                      {pl.trackIds.map((tid) => {
                        const t = trackMap.get(tid);
                        return (
                          <ListGroup.Item key={tid} className="d-flex align-items-start">
                            <div className="me-auto">
                              <div className="fw-semibold">
                                {t ? t.track_name : "Unknown track"}
                              </div>
                              <small className="text-muted">
                                {t ? t.track_artist : `ID: ${tid}`}
                              </small>
                            </div>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleRemoveTrack(pl.id, tid)}
                              aria-label={`Remove ${t ? t.track_name : "track"} from ${pl.name}`}
                            >
                              Remove
                            </Button>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  )}
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                  <small className="text-muted">ID: {pl.id}</small>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => handleDeletePlaylist(pl.id)}
                    aria-label={`Delete playlist ${pl.name}`}
                  >
                    Delete
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
}
