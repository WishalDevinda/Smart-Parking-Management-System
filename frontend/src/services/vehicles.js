// src/services/vehicles.js
// Purpose: Centralized API calls for vehicles to keep React components clean.

const BASE =
  import.meta?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const API = `${BASE.replace(/\/$/, "")}/vehicles`;

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const detail = data?.details ? ` – ${data.details}` : "";
    throw new Error(`${msg}${detail}`);
  }
  return data;
}

export const VehiclesAPI = {
  // Create a vehicle entry at entry gate (register)
  create: ({ vehicleNumber, vehicleType }) =>
    jsonFetch(API, {
      method: "POST",
      body: JSON.stringify({ vehicleNumber, vehicleType }),
    }),

  // Read all or one by id
  list: () => jsonFetch(API),
  get: (id) => jsonFetch(`${API}/${encodeURIComponent(id)}`),

  // Counter helpers
  getByNumber: (vehicleNumber) =>
    jsonFetch(`${API}/number/${encodeURIComponent(vehicleNumber)}`),

  exitByNumber: (vehicleNumber) =>
    jsonFetch(`${API}/exit`, {
      method: "POST",
      body: JSON.stringify({ vehicleNumber }),
    }),
};
