import express from 'express';
import cors from 'cors';

// Routers
import tracksRouter from './routes/tracks.js';        
import albumsRouter from './routes/albums.js';        
import playlistsRouter from './routes/playlists.js' // optional, if you have it

// Error middleware (optional file you already have)
import errorHandler from './middleware/error-handler.js';

const app = express();

// Allow your Vite frontend (http://localhost:5173) to call the API
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Quick healthcheck
// app.get('/health', (req, res) => res.json({ ok: true }));

// Mount API routes
app.use('/api/tracks', tracksRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/playlists', playlistsRouter);

// Centralized error handler (keeps route code clean)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 53705;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
