const Reservation = require('../models/Reservation');
const ParkingSlot = require('../models/ParkingSlot');
const Driver = require('../models/Driver');
const fs = require('fs');
const path = require('path');

// Generate unique reservation ID
const generateReservationId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `RES${timestamp}${random}`.toUpperCase();
};

// Get all reservations
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('driverId', 'name email')
      .populate('parkingSlotId', 'slotId location');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reservations by driver ID
const getReservationsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const reservations = await Reservation.find({ driverId })
      .populate('driverId', 'name email')
      .populate('parkingSlotId', 'slotId location');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new reservation
const createReservation = async (req, res) => {
  try {
    const { driverId, parkingSlotId, entryTime, exitTime, contactNumber, vehicleNumber, vehicleType } = req.body;

    // Check if parking slot exists and is available
    const parkingSlot = await ParkingSlot.findById(parkingSlotId);
    if (!parkingSlot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (!parkingSlot.isAvailable) {
      return res.status(400).json({ message: 'Parking slot is not available' });
    }

    // Check if driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Generate reservation ID
    const reservationId = generateReservationId();

    // Create reservation
    const reservation = new Reservation({
      reservationId,
      driverId: driverId, // Use the driverId directly as it's now the primary key
      parkingSlotId,
      entryTime: new Date(entryTime),
      exitTime: new Date(exitTime),
      contactNumber,
      vehicleNumber,
      vehicleType
    });

    const savedReservation = await reservation.save();

    // Update parking slot availability
    await ParkingSlot.findByIdAndUpdate(parkingSlotId, { isAvailable: false });

    // Populate the saved reservation
    const populatedReservation = await Reservation.findById(savedReservation._id)
      .populate('driverId', 'name email')
      .populate('parkingSlotId', 'slotId location');

    // Emit socket events for real-time updates
    if (req.io) {
      req.io.emit('reservationUpdate', populatedReservation);
      req.io.emit('slotUpdate', { slotId: parkingSlotId, isAvailable: false });
    }

    res.status(201).json(populatedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  try {
    const { entryTime, exitTime, status } = req.body;
    
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { 
        entryTime: entryTime ? new Date(entryTime) : undefined,
        exitTime: exitTime ? new Date(exitTime) : undefined,
        status 
      },
      { new: true, runValidators: true }
    ).populate('driverId', 'name email')
     .populate('parkingSlotId', 'slotId location');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // If reservation is completed or cancelled, make slot available
    if (status === 'completed' || status === 'cancelled') {
      await ParkingSlot.findByIdAndUpdate(reservation.parkingSlotId, { isAvailable: true });
      
      // Emit socket event for slot update
      if (req.io) {
        req.io.emit('slotUpdate', { slotId: reservation.parkingSlotId, isAvailable: true });
      }
    }

    // Emit socket event for reservation update
    if (req.io) {
      req.io.emit('reservationUpdate', reservation);
    }

    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete reservation
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Make parking slot available again
    await ParkingSlot.findByIdAndUpdate(reservation.parkingSlotId, { isAvailable: true });

    // Emit socket events for real-time updates
    if (req.io) {
      req.io.emit('reservationUpdate', { deleted: true, id: req.params.id });
      req.io.emit('slotUpdate', { slotId: reservation.parkingSlotId, isAvailable: true });
    }

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate reservation report
const generateReport = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('driverId', 'name email')
      .populate('parkingSlotId', 'slotId location');

    let reportContent = 'SMART PARKING MANAGEMENT SYSTEM - RESERVATION REPORT\n';
    reportContent += '='.repeat(60) + '\n\n';
    reportContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    reservations.forEach((reservation, index) => {
      reportContent += `${index + 1}. Reservation ID: ${reservation.reservationId}\n`;
      reportContent += `   Driver: ${reservation.driverId.name} (${reservation.driverId.email})\n`;
      reportContent += `   Contact: ${reservation.contactNumber}\n`;
      reportContent += `   Vehicle: ${reservation.vehicleNumber} (${reservation.vehicleType})\n`;
      reportContent += `   Parking Slot: ${reservation.parkingSlotId.slotId} - ${reservation.parkingSlotId.location}\n`;
      reportContent += `   Reserved Date: ${new Date(reservation.reservedDate).toLocaleDateString()}\n`;
      reportContent += `   Entry Time: ${new Date(reservation.entryTime).toLocaleString()}\n`;
      reportContent += `   Exit Time: ${new Date(reservation.exitTime).toLocaleString()}\n`;
      reportContent += `   Status: ${reservation.status}\n`;
      reportContent += '-'.repeat(50) + '\n\n';
    });

    reportContent += `\nTotal Reservations: ${reservations.length}\n`;

    const fileName = `reservation_report_${Date.now()}.txt`;
    const filePath = path.join(__dirname, '..', 'reports', fileName);

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, reportContent);

    res.json({ 
      message: 'Report generated successfully',
      fileName,
      downloadUrl: `/api/reservations/download-report/${fileName}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download report
const downloadReport = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '..', 'reports', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Report file not found' });
    }

    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllReservations,
  getReservationsByDriver,
  createReservation,
  updateReservation,
  deleteReservation,
  generateReport,
  downloadReport
};
