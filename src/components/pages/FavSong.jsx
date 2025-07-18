import React, { useContext, useEffect, useState } from "react"
import TracksContext from "../contexts/TracksContext";
import FavCard from "./content/FavCard";
import { Col, Row } from "react-bootstrap";

function FavSong() {
    const { allTracks } = useContext(TracksContext);

    const [favTrackIds, setFavTrackIds] = useState(() => {
        return JSON.parse(localStorage.getItem("favriouteTracksIds") || "[]");
    });
    useEffect(() => {
        localStorage.setItem("favriouteTracksIds", JSON.stringify(favTrackIds));
    }, [favTrackIds]);

    const handleUnselect = (id) =>
        setFavTrackIds(prev => prev.filter(pid => pid !== id));

    const favTracks = allTracks.filter((t) => favTrackIds.includes(t.track_id));

    return <>
        <h1>Your favorite songs!</h1>
        {favTracks.length === 0 ? (
            <p>You have no favrioute songs yet.</p>
        ) : (
            <Row>
                {favTracks.map(ft => (
                    <Col key={ft.track_id} xs={12} sm={6} md={4} lg={3}>
                        <FavCard
                            track={ft}
                            onUnselect={() => handleUnselect(ft.track_id)}
                        />
                    </Col>
                ))}
            </Row>
        )}
    </>
}

export default FavSong;
