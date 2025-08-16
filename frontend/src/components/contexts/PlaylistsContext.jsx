import { createContext, useState } from "react";
import api from "../../api"; // uses your axios base (VITE_API_URL)

const PlaylistsContext = createContext({
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  loadPlaylists: () => {},
});

export default PlaylistsContext;

export function PlaylistsProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadPlaylists({ name = "", limit = 100, offset = 0 } = {}) {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (name) params.playlist = name.trim();   // backend accepts ?playlist=...
      params.limit = limit;
      params.offset = offset;

      const res = await api.get("/playlists", { params });
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
  }

  return (
    <PlaylistsContext.Provider value={{ items: playlists, total, isLoading, error, loadPlaylists }}>
      {children}
    </PlaylistsContext.Provider>
  );
}
