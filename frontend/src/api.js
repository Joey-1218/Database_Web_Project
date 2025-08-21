// frontend/src/api.js
import axios from "axios";

function extractToken() {
  // 1) direct token (if you also store it separately)
  const direct = sessionStorage.getItem("token");
  if (direct) return direct;

  // 2) your current blob under "key"
  const raw = sessionStorage.getItem("auth");
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    // support common shapes
    if (typeof obj === "string") return obj;
    if (obj?.token) return obj.token;
    if (obj?.data?.token) return obj.data.token;
  } catch {
    // if it's not JSON, maybe it's a bare token string
    return raw;
  }
  return null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:53705/api",
});

api.interceptors.request.use((config) => {
  const token = extractToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
