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

  const [tab, setTab] = useState("explore");
  const isMine = tab === "mine";

  // single, authoritative loader effect — triggers on tab/limit/offset
  useEffect(() => {
    const name = (playlistNameInputRef.current?.value || "").trim();
    loadPlaylists({ name, limit, offset: 0, mine: isMine });
  }, [tab, limit, offset, isMine, loadPlaylists]);

  // remove the second effect to avoid races and stale params

  const chunk = useMemo(() => items.slice(0, offset + limit), [items, offset, limit]);

  const onSearchPlaylists = (e) => {
    e.preventDefault();
    const name = (playlistNameInputRef.current?.value || "").trim();
    // reset pagination on new search
    setOffset(0);
    setLimit(PAGE_SIZE);
    loadPlaylists({ name, limit: PAGE_SIZE, offset: 0, mine: isMine });
  };

  const onReset = () => {
    if (playlistNameInputRef.current) playlistNameInputRef.current.value = "";
    // reset pagination on reset
    setOffset(0);
    setLimit(PAGE_SIZE);
    loadPlaylists({ name: "", limit: PAGE_SIZE, offset: 0, mine: isMine });
  };

  const handleLoadMore = () => setLimit((prev) => prev + PAGE_SIZE);
  const canLoadLess = limit >= 2 * PAGE_SIZE;
  const handleLoadLess = () => canLoadLess && setLimit((prev) => prev - PAGE_SIZE);

  return (
    <section>
      <h1>Playlists</h1>
      <div className="mb-3" style={{ display: "flex", gap: 8 }}>
        <Button
          size="sm"
          variant={tab === "explore" ? (theme === "light" ? "dark" : "light") : "outline-secondary"}
          onClick={() => {
            // reset pagination when switching tab
            setTab("explore");
            setOffset(0);
            setLimit(PAGE_SIZE);
          }}
          disabled={tab === "explore"}
        >
          Explore
        </Button>
        <Button
          size="sm"
          variant={tab === "mine" ? (theme === "light" ? "dark" : "light") : "outline-secondary"}
          onClick={() => {
            // reset pagination when switching tab
            setTab("mine");
            setOffset(0);
            setLimit(PAGE_SIZE);
          }}
          disabled={tab === "mine"}
          title="Shows public seed + your private playlists (requires login)"
        >
          My Playlists
        </Button>
      </div>
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

          {!isLoading && !error && items.length === 0 && <p className="">NO RESULT</p>}

          {!error && items.length > 0 && (
            <Row /* ADDED: key forces list to remount when tab switches (prevents subtle stale UI) */
                 key={tab}>
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
