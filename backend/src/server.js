import express from 'express';
import cors from 'cors';

// Routers
import tracksRouter from './routes/tracks.js';        
import albumsRouter from './routes/albums.js';        
import playlistsRouter from './routes/playlists.js' // optional, if you have it
import registerRouter from "./routes/auth/register.js";
import loginRouter from "./routes/auth/login.js";

import cookieParser from "cookie-parser";
import { authOptional } from "./middleware/auth.js";
// Error middleware 
import errorHandler from './middleware/error-handler.js';
import 'dotenv/config'; // or use dotenv.config() early
import { PORT, CORS_ORIGIN, JWT_SECRET } from './config.js'; // ensures validation runs

const app = express();

// Allow your Vite frontend (http://localhost:5173) to call the API
app.use(cors({ 
  origin: CORS_ORIGIN,
  credentials: true,
 }));
app.use(express.json());

// Quick healthcheck
// app.get('/health', (req, res) => res.json({ ok: true }));
app.use(cookieParser());
app.use(authOptional);  

// Mount API routes
app.use('/api/tracks', tracksRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
 
// Centralized error handler (keeps route code clean)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
