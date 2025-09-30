// Purpose: API helper for System Hardware (CRUD)
// Matches routes in systemHardwareRouter: /hardware, /hardware/:id
// - POST /hardware
// - GET  /hardware
// - GET  /hardware/:id
// - PUT  /hardware/:id
// - DELETE /hardware/:id

const BASE =
  import.meta?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const API = `${BASE.replace(/\/$/, "")}/hardware`;

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const details = data?.details ? ` – ${data.details}` : "";
    throw new Error(`${msg}${details}`);
  }
  return data;
}

export const SystemHardwareAPI = {
  // Create hardware: { type, status?, location? }
  create: (payload) =>
    jsonFetch(API, { method: "POST", body: JSON.stringify(payload) }),

  // Read all hardware
  list: () => jsonFetch(API),

  // Read one hardware by id (supports hardwareID or _id in your controller)
  get: (id) => jsonFetch(`${API}/${encodeURIComponent(id)}`),

  // Update hardware by id: { type?, status?, location? }
  update: (id, patch) =>
    jsonFetch(`${API}/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),

  // Delete hardware by id
  remove: (id) =>
    jsonFetch(`${API}/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
