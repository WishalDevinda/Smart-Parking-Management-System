// Unified API helper for CRA (both named + default export provided)
import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

const api = {
  client,

  vehicles: {
    // POST /api/vehicles/add
    register: (payload) => client.post("/api/vehicles/add", payload),

    // PUT /api/vehicles/finish/by-number/:vehicleNumber
    finishByNumber: (vehicleNumber) =>
      client.put(
        `/api/vehicles/finish/by-number/${encodeURIComponent(vehicleNumber)}`
      ),
  },

  onlineBookings: {
    // GET /api/onlinebookings/get/:id
    getById: (id) => client.get(`/api/onlinebookings/get/${encodeURIComponent(id)}`),
  },
};

export { api };
export default api;
