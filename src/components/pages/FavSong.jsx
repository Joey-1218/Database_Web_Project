import React, { useContext, useEffect, useState } from "react"
import TracksContext from "../contexts/TracksContext";

function FavSong () {
    const allTracks = useContext(TracksContext);

    const [favTrackIds, setFavTrackIds] = useState(() => {
        return JSON.parse(sessionStorage.getItem("favriouteTracksIds") || "[]");
    });
    useEffect(() => {
        sessionStorage.setItem("favriouteTracksIds", JSON.stringify(favTrackIds));
    }, [favTrackIds]);

    const favTracks = allTracks.filter(t => favTrackIds.includes(t.track_id));

    return <>
        <h1>Your favorite songs!</h1>
        <p>still developing...</p>
    </>
}

export default FavSong;
