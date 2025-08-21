import { createContext, useCallback, useMemo, useState } from "react";
import api from "../../api";

const PlaylistsContext = createContext({
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  loadPlaylists: () => { },
});

export default PlaylistsContext;

export function PlaylistsProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // stabilize function identity so effects don't retrigger each render
  // CHANGED: stabilize function identity so effects don't retrigger each render
  const loadPlaylists = useCallback(async ({ name = "", limit = 100, offset = 0, mine = false } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (name) params.playlist = name.trim();
      params.limit = limit;
      params.offset = offset;
      if (mine) params.mine = true;

      const token = sessionStorage.getItem("token");
      const cfg = { params };
      if (token) cfg.headers = { Authorization: `Bearer ${token}` };

      const res = await api.get("/playlists", cfg);
      const data = res.data ?? {};
      setPlaylists(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total ?? 0));
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

  return (
    <PlaylistsContext.Provider value={value}>
      {children}
    </PlaylistsContext.Provider>
  );
}
