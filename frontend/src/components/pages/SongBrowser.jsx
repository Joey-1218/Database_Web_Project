import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardBody, CardTitle, Col, Form, Row, Pagination } from "react-bootstrap";
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

    const { allTracks } = useContext(TracksContext);
    // JUST PUT AN EXAMPLE HERE, WORK ON THIS LATER.
    useEffect(() => {
        api.get("/tracks?limit=200").then(res => setTracks(res.data));
    }, []);

    const [favTrackIds, setFavTrackIds] = useStorage("favTrackIds", []);

    const [filteredTracks, setFilteredTracks] = useState(allTracks);
    useEffect(() => setFilteredTracks(allTracks), [allTracks]);

    const toggleFav = (trackId) => {
        setFavTrackIds((prev) =>
            prev.includes(trackId)
                ? prev.filter((id) => id !== trackId)
                : [...prev, trackId]
        );
    };

    const onSearchTrack = (e) => {
        e.preventDefault();
        const n = trackNameInputRef.current.value.trim().toLowerCase();
        const a = trackArtistInputRef.current.value.trim().toLowerCase();

        setFilteredTracks(
            allTracks.filter(t => {
                const nameMatch = !n || t.track_name.toLowerCase().includes(n);
                const artistMatch = !a || t.track_artist.toLowerCase().includes(a);
                return nameMatch && artistMatch;
            })
        );
    };

    const onReset = () => {
        // clear inputs
        if (trackNameInputRef.current) trackNameInputRef.current.value = "";
        if (trackArtistInputRef.current) trackArtistInputRef.current.value = "";

        // show all tracks again and go to page 1
        setFilteredTracks(allTracks);
        setPage(1);
    };

    const onSearchAlbum = (e) => {
        e.preventDefault();
        // read refs and run search...
    };

    const [page, setPage] = useState(1);

    // Whenever filteredTracks changes (e.g., first load or after a new search),
    // go back to the first page.
    useEffect(() => setPage(1), [filteredTracks]);

    const totalPages = Math.max(1, Math.ceil(filteredTracks.length / PAGE_SIZE));
    const pageSlice = useMemo(() => {
        const startIndex = (page - 1) * PAGE_SIZE;
        return filteredTracks.slice(startIndex, startIndex + PAGE_SIZE)
    }, [filteredTracks, page]);

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
                    {filteredTracks.length === 0 ?
                        (
                            <p>Loading</p>
                        ) : (
                            <Row>
                                {pageSlice.map(track => (
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