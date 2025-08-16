import { Button, Card, Col, Form } from "react-bootstrap";

export default function PlaylistSearchSidebar({
  theme,
  playlistNameInputRef,
  onReset,
  onSearchPlaylists, // (e) => void
  colProps = { xs: 2, sm: 2, md: 3, lg: 3 },
  total,
  numDisplayed,
  disabled,
  onLoadLess,
}) {
  return (
    <Col {...colProps}>
      <div>
        <Card>
          <Card.Title className="mx-auto mt-2">Find a playlist</Card.Title>
          <Card.Body>
            <Form onSubmit={onSearchPlaylists}>
              <Form.Group controlId="searchPlaylistName" className="mb-3">
                <Form.Label>Playlist Name</Form.Label>
                <Form.Control ref={playlistNameInputRef} />
              </Form.Group>
             
              <div className="d-flex gap-2">
                <Button variant={theme === "light" ? "dark" : "light"} type="submit">
                  Search
                </Button>
                <Button variant={theme === "light" ? "dark" : "light"} onClick={onReset}>
                  Reset
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>

      <div className="mx-auto mt-2">
        {total === 1 ? (
          <p>There is 1 playlist that matches your search!</p>
        ) : (
          <p>There are {total} playlists that match your search!</p>
        )}
      </div>

      <div className="mx-auto mt-2">
        {numDisplayed === 1 ? (
          <p>There is 1 playlist currently displayed!</p>
        ) : (
          <p>There are {numDisplayed} playlists currently displayed!</p>
        )}
      </div>

      <div>
        <Button onClick={onLoadLess} disabled={disabled} variant={theme === "light" ? "dark" : "light"}>
          Load Less
        </Button>
      </div>
    </Col>
  );
}
