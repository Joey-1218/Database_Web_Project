// src/contexts/PlaylistContext.jsx
import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "spotify-playlists";

/**
 * Playlist object shape:
 * {
 *   id:   string, // unique key
 *   name: string,
 *   desc: string,
 *   trackIds: string[] // array of track_id
 * }
 */
const PlaylistContext = createContext({
  playlists: [],
  addPlaylist: () => {},
  deletePlaylist: () => {},
  addTrackTo: () => {},
  removeTrackFrom: () => {}
});

export function PlaylistProvider({ children }) {
  /* --- load from localStorage on first render --- */
  const [playlists, setPlaylists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  /* --- persist on any change --- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  /* --- helper fns --------------------------------------------------- */
  const addPlaylist = useCallback((name, desc = "") =>
    setPlaylists(prev => [
      ...prev,
      { id: Date.now().toString(), name, desc, trackIds: [] }
    ]), []);

  const deletePlaylist = useCallback(plId =>
    setPlaylists(prev => prev.filter(pl => pl.id !== plId)), []);

  const addTrackTo = useCallback((plId, trackId) =>
    setPlaylists(prev => prev.map(pl =>
      pl.id === plId && !pl.trackIds.includes(trackId)
        ? { ...pl, trackIds: [...pl.trackIds, trackId] }
        : pl
    )), []);

  const removeTrackFrom = useCallback((plId, trackId) =>
    setPlaylists(prev => prev.map(pl =>
      pl.id === plId
        ? { ...pl, trackIds: pl.trackIds.filter(id => id !== trackId) }
        : pl
    )), []);

  const value = useMemo(() => ({
    playlists,
    addPlaylist,
    deletePlaylist,
    addTrackTo,
    removeTrackFrom
  }), [playlists, addPlaylist, deletePlaylist, addTrackTo, removeTrackFrom]);

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export default PlaylistContext;
