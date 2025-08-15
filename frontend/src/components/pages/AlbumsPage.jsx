import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import { Button, Col, Row } from "react-bootstrap";
import AlbumsContext from "../contexts/AlbumsContext";
import AlbumSearchSidebar from "./content/AlbumSearchSideBar";
import AlbumCard from "./content/AlbumCard";
import { ThemeContext } from "../contexts/ThemeContext";
const PAGE_SIZE = 36;

export default function AlbumsPage() {
  const albumNameInputRef = useRef();
  const albumArtistInputRef = useRef();

  const { theme } = useContext(ThemeContext);

  const { items, total, loading, error, loadAlbums } = useContext(AlbumsContext);


  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  // Initial load (empty search)
  useEffect(() => {
    loadAlbums({ album: "", artist: "", limit, offset });
  }, []); // run once on mount

  // When page changes, refetch using current input values
  useEffect(() => {
    // Read current (uncontrolled) values
    const album = (albumNameInputRef.current?.value || "").trim();
    const artist = (albumArtistInputRef.current?.value || "").trim();

    loadAlbums({ album, artist, limit, offset });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  const chunk = useMemo(() => {
    return items.slice(0, offset + limit)
  }, [items, offset]);

  const onSearchAlbum = (e) => {
    e.preventDefault();
    const album = (albumNameInputRef.current?.value || "").trim();
    const artist = (albumArtistInputRef.current?.value || "").trim();

    // Fetch with current inputs
    loadAlbums({ album, artist, limit, offset: 0 });
  };

  const onReset = () => {
    if (albumNameInputRef.current) albumNameInputRef.current.value = "";
    if (albumArtistInputRef.current) albumArtistInputRef.current.value = "";
    loadAlbums({ album: "", artist: "", limit, offset: 0 });
  };

  const handleLoadMore = () => {
        // setOffset(prev => prev + PAGE_SIZE);
        setLimit(prev => prev + PAGE_SIZE)
    }

  return (
    <section>
      <h1>Albums</h1>
      <Row>
        <AlbumSearchSidebar
          theme={theme}
          albumNameInputRef={albumNameInputRef}
          albumArtistInputRef={albumArtistInputRef}
          onSearchAlbum={onSearchAlbum}
          onReset={onReset}
          total={total}
        />
        <Col xs={10} sm={10} md={9} lg={9}>
          {loading && <p>Loading…</p>}
          {error && <p style={{ color: "red" }}>Error: {String(error.message || error)}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="">NO RESULT</p>
          )}

          {!loading && !error && items.length > 0 && (
            <Row>
              {chunk.map((a) => (
                <AlbumCard album={a}/>
                // <p key={a.album_id}>{a.album_name} by {a.artist_names} is released on {a.release_date}.</p>
              ))}
              <Button onClick={handleLoadMore} disabled={total <= limit}>Load More</Button>
            </Row>
          )}
        </Col>
      </Row>
    </section>

  );
}
