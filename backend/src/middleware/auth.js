// middleware/auth.js
import jwt from "jsonwebtoken";

export function authOptional(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return next();

  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer "))
    token = req.headers.authorization.split(" ")[1];

  if (!token) return next();

  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, username: payload.username };
  } catch (_) {
    // ignore invalid/expired tokens; don’t throw
  }
  next();
}

// named export so routes can `import { authRequired } ...`
export function authRequired(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Auth required" });
  next();
}
