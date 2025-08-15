import { Button, Card, Col, Form } from "react-bootstrap";

export default function SearchSidebar({
    theme,
    albumNameInputRef,
    albumArtistInputRef,
    onReset,
    onSearchAlbum,  // (e) => void
    colProps = { xs: 2, sm: 2, md: 3, lg: 3 },
    total,
    numDisplayed,
    disabled,
    onLoadLess,
}) {
    return (
        <Col {...colProps}>
            <div>
                <Card>
                    <Card.Title className="mx-auto mt-2">Find an album</Card.Title>
                    <Card.Body>
                        <Form onSubmit={onSearchAlbum}>
                            <Form.Group controlId="searchAlbumName" className="mb-3">
                                <Form.Label>Album Name</Form.Label>
                                <Form.Control ref={albumNameInputRef} />
                            </Form.Group>
                            <Form.Group controlId="searchArtistName" className="mb-3">
                                <Form.Label>Artist Name</Form.Label>
                                <Form.Control ref={albumArtistInputRef} />
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
                    ? <p>There are {total} albums that match your search!</p>
                    : <p>There is {total} album that matches your search!</p>
                }
            </div>

             <div className="mx-auto mt-2">
                {numDisplayed > 1
                    ? <p>There are {numDisplayed} tracks currently displayed!</p>
                    : <p>There is {numDisplayed} track currently displayed!</p>
                }
            </div>

            <div>
                <Button
                    onClick={onLoadLess}
                    disabled={disabled}
                    variant={theme === "light" ? "dark" : "light"}
                >
                    Load Less
                </Button>
            </div>
        </Col>
    );
}

