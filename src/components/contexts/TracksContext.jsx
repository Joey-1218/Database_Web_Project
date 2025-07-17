import React from "react";
import tracksData from "../data/tracks.json";

const LOCAL_KEY = "spotifyFavs";

export const TracksContext = React.createContext([]);

/* helper: read favorites from localStorage -> Set */
function loadFavs() {
    try {
        const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        return new Set(raw);
    } catch {
        return new Set();
    }
}

/* helper: persist Set -> localStorage */
function saveFavs(set) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.from(set)));
}

export function TracksProvider({ children }) {
    // load tracks once (static import already bundled)
    const [tracks] = React.useState(tracksData);

    // favorites
    const [favSet, setFavSet] = React.useState(() => loadFavs());

    const toggleFav = React.useCallback((track_id) => {
        setFavSet(prev => {
            const next = new Set(prev);
            next.has(track_id) ? next.delete(track_id) : next.add(track_id);
            saveFavs(next);
            return next;
        });
    }, []);

    const clearFavs = React.useCallback(() => {
        setFavSet(new Set());
        saveFavs(new Set());
    }, []);

    const value = React.useMemo(() => ({
        tracks,
        favorites: favSet,                     // Set of track_ids
        favCount: favSet.size,
        isFav: id => favSet.has(id),
        toggleFav,
        clearFavs,
    }), [tracks, favSet, toggleFav, clearFavs]);

    return (
        <TracksContext.Provider value={value}>
            {children}
        </TracksContext.Provider>
    );
}

/* convenience hook */
export function useTracks() {
    const ctx = React.useContext(TracksContext);
    if (!ctx) throw new Error("useTracks must be used within TracksProvider");
    return ctx;
}
