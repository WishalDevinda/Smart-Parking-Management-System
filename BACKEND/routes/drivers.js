const express = require('express');
const router = express.Router();
const {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  loginDriver
} = require('../controllers/driverController');

// Get all drivers
router.get('/', getAllDrivers);

// Get driver by ID
router.get('/:id', getDriverById);

// Create new driver
router.post('/', createDriver);

// Login driver
router.post('/login', loginDriver);

// Update driver
router.put('/:id', updateDriver);

// Delete driver
router.delete('/:id', deleteDriver);

module.exports = router;
