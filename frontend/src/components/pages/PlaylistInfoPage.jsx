import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ThemeContext } from "../contexts/ThemeContext";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../api";
import "./styles/PlaylistInfoPage.css";

export default function PlaylistInfoPage() {
  const { theme } = useContext(ThemeContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await api.get(`/playlists/${id}`);
        if (!ignore) setPlaylist(res.data);
      } catch (e) {
        if (!ignore) setErr(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "red" }}>Error: {String(err.message || err)}</p>;
  if (!playlist) return <p>Not found.</p>;

  const { playlist_id, playlist_name, is_seed, created_at, owner_name } = playlist;

  let tracks = [];
  try {
    if (Array.isArray(playlist.tracks)) {
      tracks = playlist.tracks;
    } else if (typeof playlist.tracks === "string" && playlist.tracks.trim()) {
      tracks = JSON.parse(playlist.tracks);
    }
  } catch {
    tracks = [];
  }

  return (
    <section className="playlist-page">
      <header className="playlist-header">
        <h1 className="playlist-title">{playlist_name ?? "(Untitled Playlist)"}</h1>
        <div className="playlist-meta">
          {owner_name ? <span><strong>Owner:</strong> {owner_name} • </span> : null}
          <strong>Created:</strong> {created_at || "Unknown"} •{" "}
          {is_seed ? <span title="Seed playlist">Seed</span> : <span>Custom</span>}
        </div>
      </header>

      <div className="section">
        <h2>Track(s)</h2>
        {tracks.length === 0 ? (
          <p>(No track info)</p>
        ) : (
          <ol className="tracks-list">
            {tracks.map(t => (
              <li key={t.track_id}>
                <Link className="track-link" to={`/songs/${t.track_id}`}>
                  {t.track_name}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="actions">
        <Button onClick={() => navigate(-1)} variant={theme === "light" ? "dark" : "light"}>
          Back
        </Button>
      </div>
    </section>
  );
}
