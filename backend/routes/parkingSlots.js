const express = require('express');
const router = express.Router();
const {
  getAllParkingSlots,
  getAvailableSlots,
  getSlotStatistics,
  createParkingSlot,
  updateSlotAvailability
} = require('../controllers/parkingSlotController');

// Get all parking slots
router.get('/', getAllParkingSlots);

// Get available parking slots
router.get('/available', getAvailableSlots);

// Get slot statistics
router.get('/statistics', getSlotStatistics);

// Create new parking slot
router.post('/', createParkingSlot);

// Update slot availability
router.put('/:id/availability', updateSlotAvailability);

module.exports = router;
