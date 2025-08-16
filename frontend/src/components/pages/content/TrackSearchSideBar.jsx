// src/components/SearchSidebar.jsx
import { Col, Card, Form, Button } from "react-bootstrap";

export default function SearchSidebar({
    theme,
    trackNameInputRef,
    trackArtistInputRef,
    onSearchTrack,  // (e) => void
    onReset,
    onLoadLess,
    disabled,
    numDisplayed,
    colProps = { xs: 2, sm: 2, md: 3, lg: 3 },
    total,
    sort,
    setSort,
    dir,
    setDir,
    setLimit,
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

            <div className="d-flex align-items-center gap-3 mt-3">
                {/* Sort by */}
                <Form.Select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setLimit(100); }}
                    className="form-select"
                    style={{ width: 280 }}
                    aria-label="Sort by"
                >
                    <option value="">Default (popularity desc, name)</option>
                    <option value="name">Name</option>
                    <option value="popularity">Popularity</option>
                    <option value="release">Release date</option>
                    <option value="danceability">Danceability</option>
                    <option value="energy">Energy</option>
                    <option value="key">Key</option>
                    <option value="loudness">Loudness</option>
                    <option value="mode">Mode</option>
                    <option value="speechiness">Speechiness</option>
                    <option value="acousticness">Acousticness</option>
                    <option value="instrumentalness">Instrumentalness</option>
                    <option value="liveness">Liveness</option>
                    <option value="valence">Valence</option>
                    <option value="tempo">Tempo</option>
                    <option value="duration">Duration</option>
                </Form.Select>
                {/* Direction */}
                <Button
                    variant={theme === "light" ? "outline-dark" : "outline-light"}
                    onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    aria-label="Toggle sort direction"
                    disabled={sort === ''}
                >
                    {dir === 'asc' ? '↑ ASC' : '↓ DESC'}
                </Button>
            </div>
        </Col>
    );
}
