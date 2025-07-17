import React from "react";
import SongBrowser from '../pages/SongBrowser'
import tracksData from "../data/tracks.json";

function App() {
  const [favorites, setFavorites] = React.useState([]);

  const toggleFav = (trackId) => {
    setFavorites((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <>
      <main style={{ padding: "1rem" }}>
        <h1>Spotify Explorer Lite (Draft)</h1>
        <SongBrowser
          tracks={tracksData}
          favorites={favorites}
          toggleFav={toggleFav}
        />
      </main>
    </>
  );
}

export default App
