import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import PlaylistsContext from "../contexts/PlaylistsContext";
import PlaylistSearchSidebar from "./content/PlaylistSearchSidebar";
import PlaylistCard from "./content/PlaylistCard";
import { ThemeContext } from "../contexts/ThemeContext";

const PAGE_SIZE = 100;

export default function PlaylistsPage() {
  const playlistNameInputRef = useRef();

  const { theme } = useContext(ThemeContext);

  const { items, total, isLoading, error, loadPlaylists } = useContext(PlaylistsContext);

  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  // Initial load (empty search)
  useEffect(() => {
    loadPlaylists({ name: "", limit, offset: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When limit/offset change, refetch using current input values
  useEffect(() => {
    const name = (playlistNameInputRef.current?.value || "").trim();
    loadPlaylists({ name, limit, offset: 0 }); // grow-by-limit, keep offset=0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  const chunk = useMemo(() => items.slice(0, offset + limit), [items, offset, limit]);

  const onSearchPlaylists = (e) => {
    e.preventDefault();
    const name = (playlistNameInputRef.current?.value || "").trim();
    // setLimit(PAGE_SIZE);
    // setOffset(0);
    loadPlaylists({ name, limit, offset: 0 });
  };

  const onReset = () => {
    if (playlistNameInputRef.current) playlistNameInputRef.current.value = "";
    // setLimit(PAGE_SIZE);
    // setOffset(0);
    loadPlaylists({ name: "", limit, offset: 0 });
  };

  const handleLoadMore = () => setLimit((prev) => prev + PAGE_SIZE);
  const canLoadLess = limit >= 2 * PAGE_SIZE;
  const handleLoadLess = () => canLoadLess && setLimit((prev) => prev - PAGE_SIZE);

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
        />
        <Col xs={10} sm={10} md={9} lg={9}>

          {error && <p style={{ color: "red" }}>Error: {String(error.message || error)}</p>}

          {!isLoading && !error && items.length === 0 && (
            <p className="">NO RESULT</p>
          )}
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
