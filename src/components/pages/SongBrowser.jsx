import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardBody, CardTitle, Col, Form, Row, Pagination } from "react-bootstrap";
import TracksContext from "../contexts/TracksContext";
import { ThemeContext } from "../contexts/ThemeContext";
import TrackCard from "./content/TrackCard";
import useStorage from "../hooks/useStorage";
const PAGE_SIZE = 12;


export default function SongBrowser() {
    const trackNameInputRef = useRef();
    const trackArtistInputRef = useRef();
    const albumNameInputRef = useRef();

    const { allTracks } = useContext(TracksContext);

    const [favTrackIds, setFavTrackIds] = useStorage("favTrackIds", []);

    const toggleFav = (trackId) => {
        setFavTrackIds((prev) =>
            prev.includes(trackId)
                ? prev.filter((id) => id !== trackId)
                : [...prev, trackId]
        );
    };

    const [page, setPage] = useState(1);

    // Whenever allTracks changes (e.g., first load or after a new search),
    // go back to the first page.
    useEffect(() => setPage(1), [allTracks]);

    const totalPages = Math.max(1, Math.ceil(allTracks.length / PAGE_SIZE));
    const pageSlice = useMemo(()=>{
        const startIndex = (page - 1) * PAGE_SIZE;
        return allTracks.slice(startIndex, startIndex + PAGE_SIZE)
    }, [allTracks, page]);

    const handlePageClick = p => setPage(p);
    const handlePrev = () => setPage(p => Math.max(1, p - 1));
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

    const { theme } = useContext(ThemeContext);

    return (
        <section>
            <h1 className="mb-4">Song Browser (Draft)</h1>
            <Row>
                <Col xs={2} md={3} lg={3}>
                    <div className="mb-4">
                        <Card>
                            <CardTitle className="mx-auto mt-2">Find a track</CardTitle>
                            <CardBody>
                                <Form /*onSubmit={handleSubmit}*/>
                                    <Form.Group controlId="searchName" className="mb-3">
                                        <Form.Label>Track Name</Form.Label>
                                        <Form.Control
                                            ref={trackNameInputRef}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="searchArtist" className="mb-3">
                                        <Form.Label>Track Artist</Form.Label>
                                        <Form.Control
                                            ref={trackArtistInputRef}
                                        />
                                    </Form.Group>

                                    <Button variant={theme==="light"?'dark':'light'} type="submit">Search</Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardTitle className="mx-auto mt-2">Find an album</CardTitle>
                            <CardBody>
                                <Form /*onSubmit={handleSubmit}*/>
                                    <Form.Group controlId="searchAlbumName" className="mb-3">
                                        <Form.Label>Album Name</Form.Label>
                                        <Form.Control
                                            ref={albumNameInputRef}
                                        />
                                    </Form.Group>
                                    <Button variant={theme==="light"?'dark':'light'} type="submit">Search</Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                </Col>
                <Col xs={10} md={9} lg={9}>
                    {allTracks.length === 0 ?
                        (
                            <p>Loading</p>
                        ) : (
                            <Row>
                                {pageSlice.map(track => (
                                    <Col key={track.track_id} xs={10} sm={6} md={4} lg={3}>
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

            <Pagination className="justify-content-center">
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