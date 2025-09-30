import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Socket connection with reconnection options
export const socket = io('http://localhost:5000', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 5
});

// Driver API
export const driverAPI = {
  getAllDrivers: () => api.get('/drivers'),
  getDriverById: (id) => api.get(`/drivers/${id}`),
  createDriver: (driver) => api.post('/drivers', driver),
  updateDriver: (id, driver) => api.put(`/drivers/${id}`, driver),
  deleteDriver: (id) => api.delete(`/drivers/${id}`),
  loginDriver: (credentials) => api.post('/drivers/login', credentials),
};

// Parking Slot API
export const parkingSlotAPI = {
  getAllSlots: () => api.get('/parking-slots'),
  getAvailableSlots: () => api.get('/parking-slots/available'),
  getSlotStatistics: () => api.get('/parking-slots/statistics'),
  createSlot: (slot) => api.post('/parking-slots', slot),
  updateSlotAvailability: (id, availability) => 
    api.put(`/parking-slots/${id}/availability`, { isAvailable: availability }),
};

// Reservation API
export const reservationAPI = {
  getAllReservations: () => api.get('/reservations'),
  getReservationsByDriver: (driverId) => api.get(`/reservations/driver/${driverId}`),
  createReservation: (reservation) => api.post('/reservations', reservation),
  updateReservation: (id, reservation) => api.put(`/reservations/${id}`, reservation),
  deleteReservation: (id) => api.delete(`/reservations/${id}`),
  generateReport: () => api.post('/reservations/generate-report'),
  downloadReport: (fileName) => {
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/reservations/download-report/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default api;
