import { createContext, useState } from "react";

const TracksContext = createContext({
    items: [],
    total: 0,
    error: null,
    isLoading: false,
    loadTracks: () => { }
});

export default TracksContext;

export function TracksProvider({ children }) {
    const [tracks, setTracks] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    async function loadTracks({ track = "", artist = "", limit = 60, offset = 0, sort = "", dir = "desc" } = {}) {
        setIsLoading(true);
        setError(null);
        try {
            // Set up query parms
            const parms = new URLSearchParams();
            if (track) parms.set("track", track.trim())
            if (artist) parms.set("artist", artist.trim())
            parms.set("limit", limit);
            parms.set("offset", offset);
            if (sort) parms.set("sort", sort);
            if (dir) parms.set("dir", dir);

            const res = await fetch(`http://localhost:53705/api/tracks?${parms.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            setTracks(Array.isArray(data.items) ? data.items : []);
            setTotal(Number(data.total) ?? 0);
        }
        catch (e) {
            setError(e);
            setTracks([]);
            setTotal(0);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <TracksContext.Provider value={{ items: tracks, total, isLoading, error, loadTracks }}>
            {children}
        </TracksContext.Provider>
    );
}
