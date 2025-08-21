// src/components/content/AddToPlaylistDropdown.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, DropdownButton, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../api";
import LoginContext from "../../contexts/LoginContext";

export default function AddToPlaylistDropdown({ trackId }) {
    const [loginStatus] = useContext(LoginContext);
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [err, setErr] = useState(null);
    const [adding, setAdding] = useState(false);
    const loadedRef = useRef(false); // load once per mount when first opened
    const navigate = useNavigate();
    const location = useLocation();

    const title = useMemo(() => (adding ? "Adding…" : "Add to Playlist"), [adding]);

    const loadMine = async () => {
        if (loadedRef.current || !loginStatus) return;
        setLoading(true); setErr(null);
        try {
            const { data } = await api.get("/playlists", { params: { mine: true, limit: 1000 } });
            const items = Array.isArray(data?.items) ? data.items : [];
            const nonSeeds = items.filter(p => Number(p.is_seed) !== 1);
            setPlaylists(nonSeeds);
            loadedRef.current = true;
        } catch (e) {
            setErr(e);
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (playlist_id) => {
        if (!playlist_id) return;
        setAdding(true);
        try {
            await api.post(`/playlists/${playlist_id}/tracks`, { track_id: trackId });
            alert("Track added!");
            // optional: navigate to that playlist
            // navigate(`/library/playlists/${playlist_id}`);
        } catch (e) {
            alert(e?.response?.data?.error || "Failed to add track");
        } finally {
            setAdding(false);
        }
    };

    if (!loginStatus) {
        // not logged in — show a link to login that returns here afterwards
        return (
            <Link
                to="/login"
                state={{ from: location }}
                className="btn btn-outline-primary btn-sm"
            >
                Log in to add
            </Link>
        );
    }

    return (
        <DropdownButton
            className="mt-2"
            variant="success"
            id="add-to-playlist"
            title={
                loading ? (
                    <>
                        <Spinner size="sm" animation="border" className="me-2" /> Loading…
                    </>
                ) : title
            }
            size="sm"
            onToggle={(isOpen) => { if (isOpen) loadMine(); }}
            disabled={adding}
        >
            {err && (
                <Dropdown.ItemText className="text-danger">
                    Failed to load playlists
                </Dropdown.ItemText>
            )}
            {playlists.length === 0 && !err && (
                <Dropdown.ItemText className="text-muted">
                    No playlists yet
                </Dropdown.ItemText>
            )}
            {playlists.map((p) => (
                <Dropdown.Item
                    key={p.playlist_id}
                    onClick={() => handleSelect(p.playlist_id)}
                    disabled={adding}
                >
                    {p.playlist_name || "(Untitled)"} {p.is_seed ? "• Seed" : ""}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
}
