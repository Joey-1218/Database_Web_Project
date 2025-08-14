// src/components/SearchSidebar.jsx
import { Col, Card, Form, Button, ButtonGroup } from "react-bootstrap";

export default function SearchSidebar({
    theme,
    trackNameInputRef,
    trackArtistInputRef,
    onSearchTrack,  // (e) => void
    onReset,
    colProps = { xs: 2, sm: 2, md: 3, lg: 3 },
    total,
}) {
    return (
        <Col {...colProps}>
            <div className="mb-4">
                <Card>
                    <Card.Title className="mx-auto mt-2">Find a track</Card.Title>
                    <Card.Body>
                        <Form onSubmit={onSearchTrack}>
                            <Form.Group controlId="searchName" className="mb-3">
                                <Form.Label>Track Name</Form.Label>
                                <Form.Control ref={trackNameInputRef} />
                            </Form.Group>
                            <Form.Group controlId="searchArtist" className="mb-3">
                                <Form.Label>Track Artist</Form.Label>
                                <Form.Control ref={trackArtistInputRef} />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={theme === "light" ? "dark" : "light"}
                                    type="submit"
                                >
                                    Search
                                </Button>
                                <Button
                                    variant={theme === "light" ? "dark" : "light"}
                                    onClick={onReset}
                                >
                                    Reset
                                </Button>
                            </div>

                        </Form>
                    </Card.Body>
                </Card>
            </div>

            <div className="mx-auto mt-2">
                {total > 1
                    ? <p>There are {total} tracks that match your search!</p>
                    : <p>There is {total} track that matches your search!</p>
                }
            </div>
        </Col>
    );
}
