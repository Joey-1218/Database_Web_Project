import { Router } from "express";
import crypto from "crypto";

export default function build(db) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const rows = await db.all("SELECT * FROM playlists LIMIT 5;");
      res.json(rows);
    } catch (err) { next(err); }
  });

  router.post("/", async (req, res, next) => {
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

  router.post("/:plId/tracks/:trackId", async (req, res, next) => {
    const { plId, trackId } = req.params;
    try {
      await db.run(
        "INSERT OR IGNORE INTO playlist_tracks VALUES (?, ?)",
        plId, trackId
      );
      res.sendStatus(204);
    } catch (err) { next(err); }
  });

  router.delete("/:plId/tracks/:trackId", async (req, res, next) => {
    const { plId, trackId } = req.params;
    try {
      await db.run(
        "DELETE FROM playlist_tracks WHERE playlist_id=? AND track_id=?",
        plId, trackId
      );
      res.sendStatus(204);
    } catch (err) { next(err); }
  });

  return router;
}
