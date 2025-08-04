import React, { useContext, useEffect, useMemo, useState } from "react"
import TracksContext from "../contexts/TracksContext";
import FavCard from "./content/FavCard";
import { Accordion, Button, Pagination } from "react-bootstrap";

import useStorage from "../hooks/useStorage";

const PAGE_SIZE = 10;

function FavSong() {
    const { allTracks } = useContext(TracksContext);

    const [favTrackIds, setFavTrackIds] = useStorage("favTrackIds", []);
    const favTracks = useMemo(
        () => allTracks.filter(t => favTrackIds.includes(t.track_id)),
        [allTracks, favTrackIds]                 // stable reference until inputs change
    );

    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [favTracks]);
    const totalPages = Math.max(1, Math.ceil(favTracks.length / PAGE_SIZE));

    const pageSlice = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return favTracks.slice(start, start + PAGE_SIZE);
    }, [favTracks, page]);


    const nextPage = () => setPage(p => Math.min(totalPages, p + 1));
    const prevPage = () => setPage(p => Math.max(1, p - 1));
    const goToPage = p => setPage(p);

    const handleUnselect = (id) =>
        setFavTrackIds(prev => prev.filter(pid => pid !== id));

    const [openKeys, setOpenKeys] = useState([]); // array of eventKeys

    const toggle = (eventKeys) => {
        setOpenKeys(eventKeys ?? []);
    };

    const toggleAll = () =>
        setOpenKeys((prev) => (prev.length ? [] : keysOnPage));

    useEffect(() => setOpenKeys([]), [page]);

    const allClosed = openKeys.length === 0;

    const eventKeyFor = (t) => String(t.track_id);

    const keysOnPage = useMemo(
        () => pageSlice.map(eventKeyFor),             // ② use pageSlice, not favTracks
        [pageSlice]
    );

    return <>
        <h1>Your favorite songs!</h1>
        <Button
            className="mb-3"
            variant={allClosed ? "primary" : "secondary"}
            onClick={toggleAll}
            disabled={pageSlice.length === 0}
        >
            {allClosed ? "Expand all" : "Collapse all"}
        </Button>

        {pageSlice.length === 0 ? (
            <p>You have no favrioute songs yet.</p>
        ) : (
            <Accordion alwaysOpen activeKey={openKeys} onSelect={toggle}>
                {pageSlice.map((ft) => {
                    return (
                        <Accordion.Item key={ft.track_id} eventKey={String(ft.track_id)}>
                            <Accordion.Header>{ft.track_name}</Accordion.Header>
                            <Accordion.Body>
                                <p className="mb-1 fs-6 fw-bold">{ft.track_artist}</p>
                                <p className="mb-1">playlist genre: {ft.playlist_genre}</p>
                                <p className="mb-1">danceability: {ft.danceability}</p>
                                <Button
                                    variant="secondary"
                                    className="me-2"
                                    onClick={() => handleUnselect(ft.track_id)}
                                >
                                    {"♥"}
                                </Button>
                            </Accordion.Body>
                        </Accordion.Item>
                    );
                })}
            </Accordion>
        )}

        <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
                disabled={page === 1}
                onClick={prevPage}
            />

            {Array.from({ length: totalPages }, (_, i) => {
                const p = i + 1;
                return (
                    <Pagination.Item
                        key={p}
                        active={p === page}
                        onClick={() => goToPage(p)}
                    >
                        {p}
                    </Pagination.Item>
                );
            })}

            <Pagination.Next
                disabled={page === totalPages}
                onClick={nextPage}
            />
        </Pagination>
    </>
}

export default FavSong;
