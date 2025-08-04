// src/components/SearchSidebar.jsx
import { Col, Card, Form, Button } from "react-bootstrap";

export default function SearchSidebar({
  theme,
  trackNameInputRef,
  trackArtistInputRef,
  albumNameInputRef,
  onSearchTrack,  // (e) => void
  onSearchAlbum,  // (e) => void
  colProps = { xs: 2, sm: 2, md: 3, lg: 3 },
}) {
  return (
    <Col {...colProps}>
      <div className="mb-4">
        <Card>
          <Card.Title className="mx-auto mt-2">Find a track</Card.Title>
          <Card.Body>
            <Form onSubmit={onSearchTrack}>
              <Form.Group controlId="searchName" className="mb-3">
                <Form.Label>Track Name</Form.Label>
                <Form.Control ref={trackNameInputRef} />
              </Form.Group>
              <Form.Group controlId="searchArtist" className="mb-3">
                <Form.Label>Track Artist</Form.Label>
                <Form.Control ref={trackArtistInputRef} />
              </Form.Group>
              <Button
                variant={theme === "light" ? "dark" : "light"}
                type="submit"
              >
                Search
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>

      <div>
        <Card>
          <Card.Title className="mx-auto mt-2">Find an album</Card.Title>
          <Card.Body>
            <Form onSubmit={onSearchAlbum}>
              <Form.Group controlId="searchAlbumName" className="mb-3">
                <Form.Label>Album Name</Form.Label>
                <Form.Control ref={albumNameInputRef} />
              </Form.Group>
              <Button
                variant={theme === "light" ? "dark" : "light"}
                type="submit"
              >
                Search
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Col>
  );
}
