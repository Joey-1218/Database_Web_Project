import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import buildTracks from "./routes/tracks.js";
import buildPlaylists from "./routes/playlists.js";
import errorHandler from "./middleware/error-handler.js";

const PORT = process.env.PORT || 53705;
const db = await initDb();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tracks", buildTracks(db));
app.use("/api/playlists", buildPlaylists(db));

app.use(errorHandler);

app.listen(PORT, () => console.log(`API ready on port ${PORT}`));
