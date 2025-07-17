import React, { useRef } from "react";
import tracksData from "../data/tracks.json";
import { Button, Card, CardBody, CardTitle, Col, Form, Row } from "react-bootstrap";

export default function SongBrowser({ tracks, favorites, toggleFav }) {
    const trackNameInputRef = useRef();
    const trackArtistInputRef = useRef();
    const albumNameInputRef = useRef();

    return (
        <section>
            <h2>Song Browser (Draft)</h2>
            <p>Total tracks: {tracksData.length}</p>
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
                            {tracksData.map(t => (
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

        </section>
    )
}