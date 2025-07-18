import React, { useContext, useState } from "react";
import { HashRouter, Route, Routes, useSearchParams } from "react-router-dom";

import HomePage from '../pages/HomePage';
import LoginPage from '../auth/LoginPage';
import LogoutPage from '../auth/LogoutPage';
import RegisterPage from '../auth/RegisterPage';
import AlbumsPage from '../pages/AlbumsPage';
import PlaylistPage from '../pages/PlaylistPage';
import FavSong from '../pages/FavSong';
import SongBrowser from '../pages/SongBrowser';
import NoMatchPage from "../pages/NoMatchPage";
import SpotifyLayout from "./SpotifyLayout";

//TODO: useContext rather than import here
import tracksData from "../data/tracks.json";
import TracksContext from "../contexts/TracksContext";

function App() {

  const [favorites, setFavorites] = React.useState([]);

  const [tracks, setTracks] = useState(tracksData);

  const toggleFav = (trackId) => {
    setFavorites((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <TracksContext.Provider value={{tracks, setTracks}}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<SpotifyLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />}></Route>
            <Route path="register" element={<RegisterPage />}></Route>
            <Route path="logout" element={<LogoutPage />}></Route>

            <Route path="library/songs" element={<SongBrowser
              tracks={tracksData}
              favorites={favorites}
              toggleFav={toggleFav}
            />}></Route>
            <Route path="library/albums" element={<AlbumsPage />}></Route>
            <Route path="library/playlists" element={<PlaylistPage />}></Route>
            <Route path="library/favsongs" element={<FavSong />}></Route>
            <Route path="*" element={<NoMatchPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </TracksContext.Provider>
  );
}

export default App
