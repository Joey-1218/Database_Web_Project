import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, CardTitle, Col, Form, Row, Pagination } from "react-bootstrap";
import TracksContext from "../contexts/TracksContext";
const PAGE_SIZE = 20;


export default function SongBrowser({ tracks, favorites, toggleFav }) {
    const trackNameInputRef = useRef();
    const trackArtistInputRef = useRef();
    const albumNameInputRef = useRef();

    const { tracks } = useContext(TracksContext);

    // const [page, setPage] = useState(1);

    // useEffect(() => setPage(1), );

    // const totalPages   = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE)); // at least 1
    // const pageStartIdx = (page - 1) * PAGE_SIZE;
    // const pageSlice    = tracks.slice(pageStartIdx, pageStartIdx + PAGE_SIZE); 

    // const handlePageClick = p => setPage(p);
    // const handlePrev      = () => setPage(p => Math.max(1, p - 1));
    // const handleNext      = () => setPage(p => Math.min(totalPages, p + 1));


    return (
        <section>
            <h2>Song Browser (Draft)</h2>
            <Row>
                <Col xs={2} md={4} lg={4}>
                    <div className="mb-4">
                        <Card>
                            <CardTitle>Find a track</CardTitle>
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

                                    <Button variant='primary' type="submit">Search</Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardTitle>Find an album</CardTitle>
                            <CardBody>
                                <Form /*onSubmit={handleSubmit}*/>
                                    <Form.Group controlId="searchAlbumName" className="mb-3">
                                        <Form.Label>Album Name</Form.Label>
                                        <Form.Control
                                            ref={albumNameInputRef}
                                        />
                                    </Form.Group>
                                    <Button variant='primary' type="submit">Search</Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                </Col>
                <Col xs={10} md={8} lg={8}>
                    <Card>
                        <ul style={{
                            overflow: "auto",
                            textAlign: "left",
                            paddingLeft: "1rem",
                        }}>
                            {tracks.map(t => (
                                <li key={t.track_id}>
                                    {t.track_name} - {t.track_artist}{" "}
                                    <Button variant="secondary" onClick={() => toggleFav(t.track_id)}>
                                        {favorites.includes(t.track_id) ? "♥" : "♡"}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </Card>

                </Col>
            </Row>

            {/* <Pagination className="justify-content-center">
                <Pagination.Prev
                    disabled={page === 1 || filteredStudents.length === 0}
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
                    disabled={page === totalPages || tracks.length === 0}
                    onClick={handleNext}
                >
                    Next
                </Pagination.Next>
            </Pagination> */}

        </section>
    )
}