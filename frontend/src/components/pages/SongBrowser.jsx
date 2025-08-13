import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Col, Row, Pagination } from "react-bootstrap";
import TracksContext from "../contexts/TracksContext";
import { ThemeContext } from "../contexts/ThemeContext";
import TrackCard from "./content/TrackCard";
import useStorage from "../hooks/useStorage";
import SearchSidebar from "../SearchSideBar";
import api from "../../api";
const PAGE_SIZE = 12;


export default function SongBrowser() {
    const trackNameInputRef = useRef();
    const trackArtistInputRef = useRef();
    const albumNameInputRef = useRef();

    //data comes from context
    const { items, total, loading, error, loadTracks } = useContext(TracksContext);

    //favrioute
    const [favTrackIds, setFavTrackIds] = useStorage("favTrackIds", []);
    const toggleFav = (trackId) => {
        setFavTrackIds((prev) =>
            prev.includes(trackId)
                ? prev.filter((id) => id !== trackId)
                : [...prev, trackId]
        );
    };

    // Pagination
    const [page, setPage] = useState(1);
    const limit = PAGE_SIZE * 5;
    const offset = 0;
    // TODO: This is hardcoded, update later!
    const totalPages = 5;

    // Initial load (empty search)
    useEffect(() => {
        loadTracks({ track: "", artist: "", limit, offset: 0 });
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

    // When page changes, refetch using current input values
    useEffect(() => {
        // Read current (uncontrolled) values
        const track = (trackNameInputRef.current?.value || "").trim();
        const artist = (trackArtistInputRef.current?.value || "").trim();

        loadTracks({ track, artist, limit, offset });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, offset]);

    const pageSlice = useMemo(() => {
        const startIndex = (page - 1) * PAGE_SIZE;
        return items.slice(startIndex, startIndex + PAGE_SIZE)
    }, [items, page]);

    // Search submit using uncontrolled refs
    const onSearchTrack = (e) => {
        e.preventDefault();
        const track = (trackNameInputRef.current?.value || "").trim();
        const artist = (trackArtistInputRef.current?.value || "").trim();

        setPage(1); // go back to first page for a new search
        // Fetch page 1 (offset 0) with current inputs
        loadTracks({ track, artist, limit, offset: 0 });
    };

    // Optional album search handler stub (not used for /api/tracks)
    const onSearchAlbum = (e) => {
        e.preventDefault();
        // This form likely belongs on your Albums page/endpoint.
    };

    // Reset: clear inputs, go to page 1, load empty search
    const onReset = () => {
        if (trackNameInputRef.current) trackNameInputRef.current.value = "";
        if (trackArtistInputRef.current) trackArtistInputRef.current.value = "";
        if (albumNameInputRef.current) albumNameInputRef.current.value = "";
        setPage(1);
        loadTracks({ track: "", artist: "", limit, offset: 0 });
    };

    const handlePageClick = p => setPage(p);
    const handlePrev = () => setPage(p => Math.max(1, p - 1));
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

    const { theme } = useContext(ThemeContext);

    return (
        <section>
            <h1 className="mb-4">Song Browser (Draft)</h1>
            <Row>
                <SearchSidebar
                    theme={theme}
                    trackNameInputRef={trackNameInputRef}
                    trackArtistInputRef={trackArtistInputRef}
                    albumNameInputRef={albumNameInputRef}
                    onSearchTrack={onSearchTrack}
                    onReset={onReset}
                    onSearchAlbum={onSearchAlbum}
                />
                <Col xs={10} sm={10} md={9} lg={9}>
                    {loading && <p>Loading…</p>}
                    {error && <p style={{ color: "red" }}>Error: {String(error.message || error)}</p>}

                    {!loading && !error && items.length === 0 && (
                        <p>LOADING...</p>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <Row>
                            {pageSlice.map((track) => (
                                <Col key={track.track_id} xs={10} sm={6} md={4} lg={3} className="mb-3">
                                    <TrackCard
                                        track={track}
                                        isFav={favTrackIds.includes(track.track_id)}
                                        onFav={() => toggleFav(track.track_id)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Col>
            </Row>

            <Pagination className="fixed-bottom justify-content-center">
                <Pagination.Prev
                    disabled={page === 1}
                    onClick={handlePrev}
                >
                    Prev
                </Pagination.Prev>

                {Array.from({ length: totalPages }, (_, idx) => {
                    const p = idx + 1;
                    return (
                        <Pagination.Item
                            key={p}
                            active={p === page}
                            onClick={() => handlePageClick(p)}
                        >
                            {p}
                        </Pagination.Item>
                    );
                })}

                <Pagination.Next
                    disabled={page === totalPages}
                    onClick={handleNext}
                >
                    Next
                </Pagination.Next>
            </Pagination>

        </section>
    )
}