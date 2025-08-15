import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ThemeContext } from "../contexts/ThemeContext";
import { Button } from "react-bootstrap";

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
        <>
            <h1 style={{ marginTop: 12 }}>{track_name}</h1>
            <p><strong>Popularity:</strong> {track_popularity ?? "N/A"}</p>
            <p><strong>Album:</strong> {album_name ?? "Unknown"} {album_id ? `(id: ${album_id})` : ""}</p>
            <p><strong>Release date:</strong> {release_date ?? "Unknown"}</p>
            <h2>Artist(s)</h2>
            {artists.length === 0 ? (
                <p>(No artist info)</p>
            ) : (
                <ul>
                    {artists.map(a => (
                        <li key={a.artist_id}>
                            {a.artist_name}
                        </li>
                    ))}
                </ul>
            )}

            <h2>Audio Features</h2>
            <ul>
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
            <Button
                onClick={() => navigate(-1)}
                variant={theme === 'light' ? 'dark' : 'light'}
            >
                Back
            </Button>
        </>
    );

}