import React, { useContext, useEffect, useMemo, useState } from "react"
import TracksContext from "../contexts/TracksContext";
import FavCard from "./content/FavCard";
import { Accordion, Button, Col, Row } from "react-bootstrap";

import useStorage from "../hooks/useStorage";

function FavSong() {
    const { allTracks } = useContext(TracksContext);

    const [favTrackIds, setFavTrackIds] = useStorage("favTrackIds", []);

    const handleUnselect = (id) =>
        setFavTrackIds(prev => prev.filter(pid => pid !== id));

    const favTracks = allTracks.filter((t) => favTrackIds.includes(t.track_id));

    const [openKeys, setOpenKeys] = useState([]);   // array of eventKeys

    const toggle = key =>
        setOpenKeys(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)   // close it
                : [...prev, key]                // open it
        );

    const allKeys = useMemo(
        () => favTracks.map((_, idx) => String(idx)),
        [favTracks]
    );

    const toggleAll = () => {
        if (openKeys.length > 0) {
            setOpenKeys([]);
        } else {
            setOpenKeys(allKeys);
        }
    }
    const allClosed = openKeys.length === 0;

    return <>
        <h1>Your favorite songs!</h1>
        <Button
            className="mb-3"
            variant={allClosed ? "primary" : "secondary"}
            onClick={toggleAll}
            disabled={!favTracks.length}
        >
            {allClosed ? "Expand all" : "Collapse all"}
        </Button>

        {favTracks.length === 0 ? (
            <p>You have no favrioute songs yet.</p>
        ) : (
            <Accordion activeKey={openKeys} onSelect={toggle}>
                {favTracks.map((ft, idx) => {
                    const key = String(idx);
                    return (
                        <Accordion.Item key={ft.track_id} eventKey={key}>
                            <Accordion.Header>{ft.track_name}</Accordion.Header>
                            <Accordion.Body>
                                <h5>{ft.track_artist}</h5>
                                <p>playlist genre: {ft.playlist_genre}</p>
                                <p>danceability: {ft.danceability}</p>
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
    </>
}

export default FavSong;
