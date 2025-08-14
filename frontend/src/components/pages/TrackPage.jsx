// src/components/pages/TrackPage.jsx
import { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";


export default function TrackPage() {
    const { theme } = useContext(ThemeContext);

    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
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
                if (!ignore) setData(json);
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
    if (!data) return <p>Not found.</p>;

    // --- Parse artists field safely ---
    let artists = [];
    try {
        if (Array.isArray(data.artists)) {
            artists = data.artists;
        } else if (typeof data.artists === "string" && data.artists.trim()) {
            artists = JSON.parse(data.artists); // server sent JSON string
        }
    } catch {
        artists = [];
    }

    const {
        track_name,
        track_popularity,
        album_id,
        album_name,
        release_date,
        danceability, energy, valence, tempo,
        duration_ms,
    } = data;

    return (
        <section style={{ padding: 16 }}>
            <Button
                variant={theme === "light" ? "dark" : "light"}
                onClick={() => navigate(-1)}
            >
                ← Back
            </Button>

            <h1 style={{ marginTop: 12 }}>{track_name}</h1>
            <p><strong>Popularity:</strong> {track_popularity ?? "N/A"}</p>
            <p><strong>Album:</strong> {album_name ?? "Unknown"} {album_id ? `(id: ${album_id})` : ""}</p>
            <p><strong>Release date:</strong> {release_date ?? "Unknown"}</p>

            <h3>Artists</h3>
            {artists.length === 0 ? (
                <p>(No artist info)</p>
            ) : (
                <ul>
                    {artists.map(a => (
                        <li key={a.artist_id}>
                            {a.artist_name} {a.artist_id != null ? `(id: ${a.artist_id})` : ""}
                        </li>
                    ))}
                </ul>
            )}

            <h3>Audio Features</h3>
            <ul>
                <li>Danceability: {danceability ?? "N/A"}</li>
                <li>Energy: {energy ?? "N/A"}</li>
                <li>Valence: {valence ?? "N/A"}</li>
                <li>Tempo: {tempo ?? "N/A"}</li>
                <li>Duration (ms): {duration_ms ?? "N/A"}</li>
            </ul>
        </section>
    );
}
