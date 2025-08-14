import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Col, Row, Button, ButtonGroup } from "react-bootstrap";
import TracksContext from "../contexts/TracksContext";
import { ThemeContext } from "../contexts/ThemeContext";
import TrackCard from "./content/TrackCard";
import useStorage from "../hooks/useStorage";
import TrackSearchSidebar from "../TrackSearchSideBar";
const PAGE_SIZE = 36;

export default function SongBrowser() {
    const trackNameInputRef = useRef();
    const trackArtistInputRef = useRef();

    //data comes from context
    const { items, total, loading, error, loadTracks } = useContext(TracksContext);

    //favrioute, to be merged into playlists
    const [favTrackIds, setFavTrackIds] = useStorage("favTrackIds", []);
    const toggleFav = (trackId) => {
        setFavTrackIds((prev) =>
            prev.includes(trackId)
                ? prev.filter((id) => id !== trackId)
                : [...prev, trackId]
        );
    };

    const [limit, setLimit] = useState(PAGE_SIZE);
    const [offset, setOffset] = useState(0);

    // Initial load (empty search)
    useEffect(() => {
        loadTracks({ track: "", artist: "", limit, offset });
    }, []); // run once on mount

    // When page changes, refetch using current input values
    useEffect(() => {
        // Read current (uncontrolled) values
        const track = (trackNameInputRef.current?.value || "").trim();
        const artist = (trackArtistInputRef.current?.value || "").trim();

        loadTracks({ track, artist, limit, offset });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit, offset]);

    const chunk = useMemo(() => {
        return items.slice(0, offset + limit)
    }, [items, offset]);

    // Search submit using uncontrolled refs
    const onSearchTrack = (e) => {
        e.preventDefault();
        const track = (trackNameInputRef.current?.value || "").trim();
        const artist = (trackArtistInputRef.current?.value || "").trim();

        // Fetch page 1 (offset 0) with current inputs
        loadTracks({ track, artist, limit, offset: 0 });
    };

    // Reset: clear inputs, go to page 1, load empty search
    const onReset = () => {
        if (trackNameInputRef.current) trackNameInputRef.current.value = "";
        if (trackArtistInputRef.current) trackArtistInputRef.current.value = "";
        // if (albumNameInputRef.current) albumNameInputRef.current.value = "";
        // setPage(1);
        loadTracks({ track: "", artist: "", limit, offset: 0 });
    };

    const handleLoadMore = () => {
        // setOffset(prev => prev + PAGE_SIZE);
        setLimit(prev => prev + PAGE_SIZE)
    }

    const { theme } = useContext(ThemeContext);

    return (
        <section>
            <h1 className="mb-4">Song Browser (Draft)</h1>
            <Row>
                <TrackSearchSidebar
                    theme={theme}
                    trackNameInputRef={trackNameInputRef}
                    trackArtistInputRef={trackArtistInputRef}
                    onSearchTrack={onSearchTrack}
                    onReset={onReset}
                    total={total}
                />
                
                <Col xs={10} sm={10} md={9} lg={9}>
                {/* Add animation for loading later */}
                    {loading && <p>Loading…</p>}
                    {error && <p style={{ color: "red" }}>Error: {String(error.message || error)}</p>}

                    {!loading && !error && items.length === 0 && (
                        <p className="">NO RESULT</p>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <Row>
                            {chunk.map((track) => (
                                <Col key={track.track_id} xs={10} sm={6} md={4} lg={3} className="mb-3">
                                    <TrackCard
                                        track={track}
                                        isFav={favTrackIds.includes(track.track_id)}
                                        onFav={() => toggleFav(track.track_id)}
                                    />
                                </Col>
                            ))}
                            <Button onClick={handleLoadMore} disabled={total <= limit}>Load More</Button>
                        </Row>
                    )}
                </Col>
            </Row>
        </section>
    )
}