// src/services/api.js
import axios from "axios";

/**
 * Infer API base:
 * - REACT_APP_API_BASE wins (e.g. http://localhost:5000)
 * - If running CRA on port 3000, default to :5000 same host
 * - Otherwise use relative '' (assumes proxy in package.json)
 */
function inferBase() {
  const env = (process.env.REACT_APP_API_BASE || "").trim();
  if (env) return env;

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (port === "3000") {
      return `${protocol}//${hostname}:5000`;
    }
  }
  return "";
}

const http = axios.create({
  baseURL: inferBase(),
  headers: { "Content-Type": "application/json" },
});

const normalizeList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.vehicles)) return data.vehicles;
  if (Array.isArray(data.vehicle)) return data.vehicle;
  return [];
};

// Fallback helpers: try multiple endpoints if the first returns 404
async function postWithFallback(paths, payload) {
  let lastErr;
  for (const p of paths) {
    try {
      return await http.post(p, payload);
    } catch (e) {
      if (e?.response?.status === 404) {
        lastErr = e;
        continue; // try next path
      }
      throw e;
    }
  }
  throw lastErr || new Error("All POST paths failed");
}
async function getWithFallback(paths) {
  let lastErr;
  for (const p of paths) {
    try {
      return await http.get(p);
    } catch (e) {
      if (e?.response?.status === 404) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error("All GET paths failed");
}

const api = {
  vehicles: {
    register: (payload) => http.post("/api/vehicles/add", payload),

    async finishByNumber(vehicleNumber) {
      const res = await http.get("/api/vehicles/getAll");
      const list = normalizeList(res.data);
      const match = list.find(
        (v) =>
          String(v.vehicleNumber).toUpperCase() ===
          String(vehicleNumber).toUpperCase()
      );
      if (!match || !match.vehicleID) {
        const err = new Error("Vehicle not found for finish");
        err.response = { data: { message: "Vehicle not found for finish" } };
        throw err;
      }
      return http.put(`/api/vehicles/finish/${encodeURIComponent(match.vehicleID)}`);
    },

    getAll: () => http.get("/api/vehicles/getAll"),
  },

  systemHardware: {
    async getAll() {
      return getWithFallback([
        "/api/systemHardwares/getAll",
        "/api/systemHardwares",
        "/api/systemHardware/getAll",
        "/api/systemHardware",
      ]);
    },

    getById: (id) =>
      http.get(`/api/systemHardwares/get/${encodeURIComponent(id)}`),

    // ✅ Robust add with path fallbacks
    add: (payload) =>
      postWithFallback(
        [
          "/api/systemHardwares/add",
          "/api/systemHardware/add",
          "/api/systemHardwares",
          "/api/systemHardware",
        ],
        payload
      ),

    update: (id, payload) =>
      http.put(`/api/systemHardwares/update/${encodeURIComponent(id)}`, payload),

    delete: (id) =>
      http.delete(`/api/systemHardwares/delete/${encodeURIComponent(id)}`),
  },

  onlineBookings: {
    getById: (id) =>
      http.get(`/api/onlinebookings/get/${encodeURIComponent(id)}`),
  },
};

export default api;
