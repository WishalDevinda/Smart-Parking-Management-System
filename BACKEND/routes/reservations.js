const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservationsByDriver,
  createReservation,
  updateReservation,
  deleteReservation,
  generateReport,
  downloadReport
} = require('../controllers/reservationController');

// Get all reservations
router.get('/', getAllReservations);

// Get reservations by driver
router.get('/driver/:driverId', getReservationsByDriver);

// Create new reservation
router.post('/', createReservation);

// Update reservation
router.put('/:id', updateReservation);

// Delete reservation
router.delete('/:id', deleteReservation);

// Generate report
router.post('/generate-report', generateReport);

// Download report
router.get('/download-report/:fileName', downloadReport);

module.exports = router;
