// src/services/api.js
import axios from "axios";

/**
 * Infer API base:
 * - REACT_APP_API_BASE wins (e.g. http://localhost:5000)
 * - If running CRA/Vite dev on port 3000/5173, default to same host :5000
 * - Otherwise fallback to relative '' (assumes a proxy is configured)
 */
function inferBase() {
  const env = (process.env.REACT_APP_API_BASE || "").trim();
  if (env) return env;

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (port === "3000" || port === "5173") {
      return `${protocol}//${hostname}:5000`;
    }
    // relative base (proxy in dev or same origin in prod)
    return "";
  }
  return "";
}

const http = axios.create({
  baseURL: inferBase(),
  headers: { "Content-Type": "application/json" },
  // you can add withCredentials: true if you use cookies
});

/* ---------------------------------------
   API surface
---------------------------------------- */
const api = {
  /* -------- Vehicles -------- */
  vehicles: {
    // Entry: register a vehicle
    register: (payload) => http.post("/api/vehicles/add", payload),

    // Exit: finish by vehicle number (FIXED: correct method + path)
    finishByNumber: (vehicleNumber) =>
      http.put(
        `/api/vehicles/finish/by-number/${encodeURIComponent(vehicleNumber)}`
      ),

    // List all vehicles
    getAll: () => http.get("/api/vehicles/getAll"),
  },

  /* -------- System Hardware -------- */
  systemHardware: {
    // List
    getAll: () => http.get("/api/systemHardwares/getAll"),

    // Add
    add: (payload) => http.post("/api/systemHardwares/add", payload),

    // Update by id
    update: (id, payload) =>
      http.put(`/api/systemHardwares/update/${encodeURIComponent(id)}`, payload),

    // Delete by id
    delete: (id) =>
      http.delete(`/api/systemHardwares/delete/${encodeURIComponent(id)}`),
  },

  /* -------- Online Bookings (if used elsewhere) -------- */
  onlineBookings: {
    getById: (id) => http.get(`/api/onlinebookings/get/${encodeURIComponent(id)}`),
  },
};

export default api;
