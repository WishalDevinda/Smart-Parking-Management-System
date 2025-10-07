require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Import routes
const driverRoutes = require('./routes/drivers');
const parkingSlotRoutes = require('./routes/parkingSlots');
const reservationRoutes = require('./routes/reservations');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Add socket.io instance to request object for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/drivers', driverRoutes);
app.use('/api/parking-slots', parkingSlotRoutes);
app.use('/api/reservations', reservationRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Listen for reservation updates
  socket.on('reservationUpdate', (data) => {
    socket.broadcast.emit('reservationUpdate', data);
  });

  // Listen for slot availability updates
  socket.on('slotUpdate', (data) => {
    socket.broadcast.emit('slotUpdate', data);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Parking Management System API' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
