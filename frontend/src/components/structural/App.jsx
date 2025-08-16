import React, { useContext, useState } from "react";
import { HashRouter, Route, Routes, useSearchParams } from "react-router-dom";

import HomePage from '../pages/HomePage';
import LoginPage from '../auth/LoginPage';
import LogoutPage from '../auth/LogoutPage';
import RegisterPage from '../auth/RegisterPage';
import AlbumsPage from '../pages/AlbumsPage';
import PlaylistPage from '../pages/PlaylistPage';
import SongBrowser from '../pages/SongBrowser';
import NoMatchPage from "../pages/NoMatchPage";
import SpotifyLayout from "./SpotifyLayout";

import { TracksProvider } from "../contexts/TracksContext";
import ThemeProvider from "../contexts/ThemeContext";
import { PlaylistProvider } from "../contexts/PlaylistContext";
import { AlbumsProvider } from "../contexts/AlbumsContext";
import TrackInfoPage from "../pages/TrackInfoPage";
import AlbumInfoPage from "../pages/AlbumInfoPage";

function App() {

  return (
    <PlaylistProvider>
      <TracksProvider>
        <AlbumsProvider>
          <ThemeProvider>
            <HashRouter>
              <Routes>
                <Route path="/" element={<SpotifyLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="login" element={<LoginPage />}></Route>
                  <Route path="register" element={<RegisterPage />}></Route>
                  <Route path="logout" element={<LogoutPage />}></Route>

                  <Route path="library/songs" element={<SongBrowser />}></Route>
                  <Route path="library/albums" element={<AlbumsPage />}></Route>
                  <Route path="library/playlists" element={<PlaylistPage />}></Route>
                  <Route path="*" element={<NoMatchPage />} />
                  <Route path="songs/:id" element={<TrackInfoPage/>}></Route>
                  <Route path="albums/:id" element={<AlbumInfoPage/>}></Route>
                </Route>
              </Routes>
            </HashRouter>
          </ThemeProvider>
        </AlbumsProvider>
      </TracksProvider>
    </PlaylistProvider>
  );
}

export default App
