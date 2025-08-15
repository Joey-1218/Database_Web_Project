import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ThemeContext } from "../contexts/ThemeContext";
import { Button } from "react-bootstrap";
import "./styles/TrackInfoPage.css"

export default function TrackPage() {
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();

    const navigate = useNavigate();

    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true); setErr(null);
            try {
                const res = await fetch(`http://localhost:53705/api/tracks/${id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!ignore) setTrack(json);
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
    if (!track) return <p>Not found.</p>;

    const {
        track_id, track_name, track_popularity, album_id, danceability,
        energy, key, loudness, mode, speechiness, acousticness, instrumentalness,
        liveness, valence, tempo, duration_ms, album_name, release_date
    } = track;

    let artists = [];
    try {
        if (Array.isArray(track.artists)) {
            artists = track.artists;
        } else if (typeof track.artists === "string" && track.artists.trim()) {
            artists = JSON.parse(track.artists);
        }
    } catch {
        artists = [];
    }

    return (
        <section className="track-page">
            <header className="track-header">
                <h1 className="track-title">{track_name}</h1>

                <div className="track-meta">
                    <div className="meta-row">
                        <span className="meta-badge"><strong>Popularity:</strong> {track_popularity ?? "N/A"}</span>
                        <span className="meta-badge"><strong>Album:</strong> {album_name ?? "Unknown"}</span>
                        <span className="meta-badge"><strong>Release:</strong> {release_date ?? "Unknown"}</span>
                    </div>
                </div>
            </header>

            <div className="section">
                <h2>Artist(s)</h2>
                {artists.length === 0 ? (
                    <p>(No artist info)</p>
                ) : (
                    <ul className="artists-list">
                        {artists.map(a => (
                            <li key={a.artist_id}>{a.artist_name}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="section">
                <h2>Audio Features</h2>
                <ul className="features">
                    <li>Danceability: {danceability ?? "N/A"}</li>
                    <li>Energy: {energy ?? "N/A"}</li>
                    <li>Key: {key ?? "N/A"}</li>
                    <li>Loudness: {loudness ?? "N/A"}</li>
                    <li>Mode: {mode ?? "N/A"}</li>
                    <li>Speechiness: {speechiness ?? "N/A"}</li>
                    <li>Acousticness: {acousticness ?? "N/A"}</li>
                    <li>Instrumentalness: {instrumentalness ?? "N/A"}</li>
                    <li>Liveness: {liveness ?? "N/A"}</li>
                    <li>Valence: {valence ?? "N/A"}</li>
                    <li>Tempo: {tempo ?? "N/A"}</li>
                    <li>Duration (ms): {duration_ms ?? "N/A"}</li>
                </ul>
            </div>

            <div className="actions">
                <Button
                    onClick={() => navigate(-1)}
                    variant={theme === 'light' ? 'dark' : 'light'}
                >
                    Back
                </Button>
            </div>
        </section>
    );


}