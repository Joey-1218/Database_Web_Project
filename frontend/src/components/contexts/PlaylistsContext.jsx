// src/contexts/PlaylistsContext.jsx
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import api from "../../api";

const PlaylistsContext = createContext({
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  loadPlaylists: () => {},
});
export default PlaylistsContext;

export function PlaylistsProvider({ children }) {
  const [playlists, setPlaylists]   = useState([]);
  const [total, setTotal]           = useState(0);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);
  const lastSigRef                  = useRef(null); // avoid duplicate calls in StrictMode

  const loadPlaylists = useCallback(async (opts = {}) => {
    const { name = "", limit = 100, offset = 0, mine = false } = opts;
    const params = { limit, offset };
    const trimmed = name.trim();
    if (trimmed) params.playlist = trimmed;
    if (mine) params.mine = true;

    const sig = JSON.stringify(params);
    if (sig === lastSigRef.current) return;      // skip identical in-flight/in-dev duplicate
    lastSigRef.current = sig;

    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/playlists", { params });
      setPlaylists(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total ?? 0));
    } catch (e) {
      setError(e);
      setPlaylists([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ items: playlists, total, isLoading, error, loadPlaylists }),
    [playlists, total, isLoading, error, loadPlaylists]
  );

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>;
}
