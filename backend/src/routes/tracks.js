import { Router } from "express";
export default function build(db) {
  const r = Router();
  // GET /api/tracks?limit=50
  r.get("/", async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 100;
      const rows = await db.all("SELECT * FROM tracks LIMIT ?", limit);
      res.json(rows);
    } catch (err) { next(err); }
  });
  return r;
}
