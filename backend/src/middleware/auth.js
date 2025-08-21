// middleware/auth.js (ESM)
import jwt from "jsonwebtoken";

const AUTH_SCHEME = "Bearer";

export function authOptional(req, res, next) {
  const hdr = req.headers.authorization || "";
  const [scheme, token] = hdr.split(" ");
  if (scheme === AUTH_SCHEME && token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET); // payload: { id, username, iat, exp }
      // attach only what you need
      req.user = { id: payload.id, username: payload.username };
    } catch (_) {
      // invalid/expired token → treat as unauthenticated
    }
  }
  next();
}

export function authRequired(req, res, next) {
  const hdr = req.headers.authorization || "";
  const [scheme, token] = hdr.split(" ");
  if (!(scheme === AUTH_SCHEME && token)) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function attachUserFromJWT(req, _res, next) {
  const auth = req.headers.authorization || "";
  const [scheme, token] = auth.split(" ");
  if (scheme === "Bearer" && token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // keep only what you need
      req.user = { id: payload.id, username: payload.username };
    } catch {
      // invalid/expired → treat as unauthenticated (no req.user)
    }
  }
  next();
}
