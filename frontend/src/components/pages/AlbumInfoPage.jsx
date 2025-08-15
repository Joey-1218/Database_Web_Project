import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ThemeContext } from "../contexts/ThemeContext";
import { Button } from "react-bootstrap";

export default function AlbumInfoPage() {
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();

    const navigate = useNavigate();

    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    // useEffect(() => {
    //     let ignore = false;
    //     (async () => {
    //         setLoading(true); setErr(null);
    //         try {
    //             const res = await fetch(`http://localhost:53705/api/albums/${id}`);
    //             if (!res.ok) throw new Error(`HTTP ${res.status}`);
    //             const json = await res.json();
    //             if (!ignore) setAlbum(json);
    //         } catch (e) {
    //             if (!ignore) setErr(e);
    //         } finally {
    //             if (!ignore) setLoading(false);
    //         }
    //     })();
    //     return () => { ignore = true; };
    // }, [id]);

    // if (loading) return <p>Loading…</p>;
    // if (err) return <p style={{ color: "red" }}>Error: {String(err.message || err)}</p>;
    // if (!album) return <p>Not found.</p>;


    // let artists = [];
    // try {
    //     if (Array.isArray(album.artists)) {
    //         artists = album.artists;
    //     } else if (typeof album.artists === "string" && album.artists.trim()) {
    //         artists = JSON.parse(album.artists);
    //     }
    // } catch {
    //     artists = [];
    // }

    return (
        <>
            <p>Album id: {id}</p>
            <p>I should display all tracks of this album here</p>
            <Button
                onClick={() => navigate(-1)}
                variant={theme === 'light' ? 'dark' : 'light'}
            >
                Back
            </Button>
        </>
    );

}