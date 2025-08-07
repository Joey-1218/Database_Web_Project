import { Router } from "express";
import crypto from "crypto";

export default function build(db) {
  const r = Router();

  r.get("/", async (req, res, next) => {
    try {
      const rows = await db.all("SELECT * FROM playlists");
      res.json(rows);
    } catch (err) { next(err); }
  });

  r.post("/", async (req, res, next) => {
    try {
      const { name, desc } = req.body;
      const id = crypto.randomUUID();
      await db.run(
        "INSERT INTO playlists (id, name, desc) VALUES (?, ?, ?)",
        id, name, desc || null
      );
      res.status(201).json({ id, name, desc, trackIds: [] });
    } catch (err) { next(err); }
  });

  r.post("/:plId/tracks/:trackId", async (req, res, next) => {
    const { plId, trackId } = req.params;
    try {
      await db.run(
        "INSERT OR IGNORE INTO playlist_tracks VALUES (?, ?)",
        plId, trackId
      );
      res.sendStatus(204);
    } catch (err) { next(err); }
  });

  r.delete("/:plId/tracks/:trackId", async (req, res, next) => {
    const { plId, trackId } = req.params;
    try {
      await db.run(
        "DELETE FROM playlist_tracks WHERE playlist_id=? AND track_id=?",
        plId, trackId
      );
      res.sendStatus(204);
    } catch (err) { next(err); }
  });

  return r;
}
