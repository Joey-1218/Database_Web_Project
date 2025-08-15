import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ThemeContext } from "../contexts/ThemeContext";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./styles/AlbumInfoPage.css";


export default function AlbumInfoPage() {
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();

    const navigate = useNavigate();

    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true); setErr(null);
            try {
                const res = await fetch(`http://localhost:53705/api/albums/${id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                // console.log(json);
                if (!ignore) setAlbum(json);
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
    if (!album) return <p>Not found.</p>;

    const {
        album_id, album_name, release_date
    } = album;

    let artists = [];
    try {
        if (Array.isArray(album.artists)) {
            artists = album.artists;
        } else if (typeof album.artists === "string" && album.artists.trim()) {
            artists = JSON.parse(album.artists);
        }
    } catch {
        artists = [];
    }

    let tracks = [];
    try {
        if (Array.isArray(album.tracks)) {
            tracks = album.tracks;
        } else if (typeof album.tracks === "string" && album.tracks.trim()) {
            tracks = JSON.parse(album.tracks);
        }
    } catch {
        tracks = [];
    }

    return (
        <section className="album-page">
            <header className="album-header">
                <h1 className="album-title">{album_name}</h1>
                <div className="album-meta">
                    <strong>Release Date:</strong> {release_date || "Unknown"}
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
                <Button
                    onClick={() => navigate(-1)}
                    variant={theme === "light" ? "dark" : "light"}
                >
                    Back
                </Button>
            </div>
        </section>
    );


}