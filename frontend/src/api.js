import axios from "axios";
export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:53705/api",
});
