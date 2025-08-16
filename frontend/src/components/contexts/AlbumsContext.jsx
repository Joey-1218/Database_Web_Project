import { createContext, useState } from "react";

const AlbumsContext = createContext({
    items: [],
    total: 0,
    error: null,
    isLoading: false,
    loadAlbums: () => { }
});

export default AlbumsContext;

export function AlbumsProvider({ children }) {
    const [albums, setAlbums] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    async function loadAlbums({ album = "", artist = "", limit = 100, offset = 0 } = {}) {
        setIsLoading(true);
        setError(null);
        try {
            // Set up query parms
            const parms = new URLSearchParams();
            if (album) parms.set("album", album.trim())
            if (artist) parms.set("artist", artist.trim())
            parms.set("limit", limit);
            parms.set("offset", offset);

            const res = await fetch(`http://localhost:53705/api/albums?${parms.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            setAlbums(Array.isArray(data.items) ? data.items : []);
            setTotal(Number(data.total) ?? 0);
        }
        catch (e) {
            setError(e);
            setAlbums([]);
            setTotal(0);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <AlbumsContext.Provider value={{ items: albums, total, isLoading, error, loadAlbums }}>
            {children}
        </AlbumsContext.Provider>
    );
}
