// src/components/pages/PlaylistsPage.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import PlaylistsContext from "../contexts/PlaylistsContext";
import PlaylistSearchSidebar from "./content/PlaylistSearchSidebar";
import PlaylistCard from "./content/PlaylistCard";
import { ThemeContext } from "../contexts/ThemeContext";
import LoginContext from "../contexts/LoginContext";

const PAGE_SIZE = 100;

export default function PlaylistsPage() {
  const playlistNameInputRef = useRef();
  const skipNextEffectRef = useRef(false);
  const { theme } = useContext(ThemeContext);
  const { items, total, isLoading, error, loadPlaylists } = useContext(PlaylistsContext);

  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  // derive directly, no extra state/effect
  const [loginStatus] = useContext(LoginContext);
  const isMine = !!loginStatus;
  // Single authoritative loader
  useEffect(() => {
    if (skipNextEffectRef.current) {
      // Skip exactly one automatic fetch after a manual refresh
      skipNextEffectRef.current = false;
      return;
    }
    const name = (playlistNameInputRef.current?.value || "").trim();
    loadPlaylists({ name, limit, offset, mine: isMine }); // use the real offset
  }, [limit, offset, isMine, loadPlaylists]);

  const chunk = useMemo(() => items.slice(0, offset + limit), [items, offset, limit]);

  const onSearchPlaylists = (e) => {
    e.preventDefault();
    const name = (playlistNameInputRef.current?.value || "").trim();
    setOffset(0);
    setLimit(PAGE_SIZE);
    loadPlaylists({ name, limit: PAGE_SIZE, offset: 0, mine: isMine });
  };

  const onReset = () => {
    if (playlistNameInputRef.current) playlistNameInputRef.current.value = "";
    setOffset(0);
    setLimit(PAGE_SIZE);
    loadPlaylists({ name: "", limit: PAGE_SIZE, offset: 0, mine: isMine });
  };

  const handleLoadMore = () => setLimit((prev) => prev + PAGE_SIZE);
  const canLoadLess = limit >= 2 * PAGE_SIZE;
  const handleLoadLess = () => canLoadLess && setLimit((prev) => prev - PAGE_SIZE);

  const refreshAfterCreate = () => {
    // Clear any filter so the new item isn't filtered out
    if (playlistNameInputRef.current) playlistNameInputRef.current.value = "";
    // Prevent the very next effect-run from immediately overwriting this manual fetch
    skipNextEffectRef.current = true;
    setOffset(0);
    setLimit(PAGE_SIZE);
    // Force a refresh (bypass dedupe) and include private-by-default playlists
    loadPlaylists(
      { name: "", limit: PAGE_SIZE, offset: 0, mine: true },
      { force: true }
    );
  };
  
  return (
    <section>
      <h1>Playlists</h1>
      <Row>
        <PlaylistSearchSidebar
          theme={theme}
          playlistNameInputRef={playlistNameInputRef}
          onSearchPlaylists={onSearchPlaylists}
          onReset={onReset}
          total={total}
          numDisplayed={chunk.length}
          disabled={!canLoadLess}
          onLoadLess={handleLoadLess}
          onCreated={refreshAfterCreate}
        />
        <Col xs={10} sm={10} md={9} lg={9}>
          {error && <p style={{ color: "red" }}>Error: {String(error.message || error)}</p>}
          {!isLoading && !error && items.length === 0 && <p>NO RESULT</p>}
          {!error && items.length > 0 && (
            <Row>
              {chunk.map((p) => (
                <Col key={p.playlist_id} xs={10} sm={6} md={4} lg={3} className="mb-2">
                  <PlaylistCard playlist={p} />
                </Col>
              ))}
              <Button
                variant={theme === "light" ? "outline-dark" : "outline-light"}
                onClick={handleLoadMore}
                disabled={total <= limit}
              >
                Load More
              </Button>
            </Row>
          )}
        </Col>
      </Row>
    </section>
  );
}
