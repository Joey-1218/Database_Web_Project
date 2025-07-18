import { createContext } from "react";

/* We’ll store an object: { tracks, setTracks } */
const TracksContext = createContext({ tracks: [], setTracks: () => {} });

export default TracksContext;
