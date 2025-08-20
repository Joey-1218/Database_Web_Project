export default function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // You can branch by err.status if your code sets it
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const msg = status === 500 ? "Server error" : err.message ?? "Error";
  res.status(status).json({ error: msg });
}
