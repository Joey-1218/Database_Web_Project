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

  const [deleting, setDeleting] = useState(false); // added

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const { data } = await api.get(`/playlists/${id}`);   // axios
        const record = Array.isArray(data) ? data[0] : data;  // handle array or object
        if (!ignore) setPlaylist(record ?? null);
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

  const { playlist_id, playlist_name, playlist_genre,
    playlist_subgenre, description, created_at,
    is_seed } = playlist;

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

  // delete handler with confirm + redirect + error handling
  const handleDelete = async () => {
    if (!window.confirm("Delete this playlist? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await api.delete(`/playlists/${id}`);

      // 1) go back to the playlists page
      navigate("/library/playlists", { replace: true });

      // 2) force a refresh so the list re-queries and no stale item appears
      //    (either option works; pick one and keep it)
      setTimeout(() => {
        // Option A: hard reload
        window.location.reload();
        // Option B: react-router hard reload
        // navigate(0);
      }, 0);
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Delete failed";
      setErr(new Error(msg));
      setDeleting(false);
    }
  };

  return (
    <section className="playlist-page">
      <header className="playlist-header">
        <h1 className="playlist-title">
          {playlist_name ?? "(Untitled Playlist)"}
        </h1>

        <div className="playlist-meta">
          <span>
            <strong>Genre:</strong> {playlist_genre ?? "Unknown"}
          </span>
          {"  "}
          <span>
            <strong>Subgenre:</strong> {playlist_subgenre ?? "Unknown"}
          </span>
          {"  "}
          {created_at && (
            <span>
              <strong>Created:</strong> {created_at}
            </span>
          )}
        </div>
      </header>
      {is_seed ? <span>This is a seed playlist</span> :
        <Button
          size="sm"
          variant="success"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>}

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
