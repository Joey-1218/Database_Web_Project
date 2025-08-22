import React, { useState } from "react"; // ADDED
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
  onCreated,
}) {
  // local state for create form
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [subgenre, setSubgenre] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState("");

  // ADDED: token helper (supports either "token" or your "key" blob)
  function getToken() {
    const direct = sessionStorage.getItem("token");
    if (direct) return direct;
    const raw = sessionStorage.getItem("key");
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return obj?.token || obj?.data?.token || null;
    } catch {
      // maybe it's a bare token string
      return raw;
    }
  }
  const hasToken = !!getToken();

  // submit handler for creating a playlist
  async function onCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const token = getToken();
    if (!token) {
      setErr("Please log in to create playlists.");
      return;
    }
    setBusy(true);
    setErr(null);
    setOk("");
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:53705/api";
      const resp = await fetch(`${base}/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          genre: genre.trim() || null,
          subgenre: subgenre.trim() || null,
          description: description.trim() || null,
          // visibility defaults to 'private' on the server
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Create failed (${resp.status})`);
      }
      // success: clear form and refresh list via provided onReset()
      setName("");
      setGenre("");
      setSubgenre("");
      setDescription("");
      onCreated?.();  // ask parent to refetch so new item appears
      setOk("Playlist created!");
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

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

      {/* Create playlist (only shown if logged in) */}
      {hasToken && (
        <div className="mt-3">
          <Card>
            <Card.Title className="mx-auto mt-2">Create a playlist</Card.Title>
            <Card.Body>
              <Form onSubmit={onCreate}>
                <Form.Group className="mb-2" controlId="createPlaylistName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My awesome playlist"
                    required
                    disabled={busy}
                  />
                </Form.Group>
                <Form.Group className="mb-2" controlId="createPlaylistGenre">
                  <Form.Label>Genre</Form.Label>
                  <Form.Control
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g., hip-hop"
                    disabled={busy}
                  />
                </Form.Group>
                <Form.Group className="mb-2" controlId="createPlaylistSubgenre">
                  <Form.Label>Subgenre</Form.Label>
                  <Form.Control
                    value={subgenre}
                    onChange={(e) => setSubgenre(e.target.value)}
                    placeholder="e.g., trap"
                    disabled={busy}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="createPlaylistDesc">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    disabled={busy}
                  />
                </Form.Group>

                <div className="d-flex gap-2 align-items-center">
                  <Button
                    type="submit"
                    variant={theme === "light" ? "dark" : "light"}
                    disabled={busy || !name.trim()}
                  >
                    {busy ? "Creating..." : "Create"}
                  </Button>
                  {ok && <span style={{ color: "green" }}>{ok}</span>}
                  {err && <span style={{ color: "red" }}>{String(err)}</span>}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      )}

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
