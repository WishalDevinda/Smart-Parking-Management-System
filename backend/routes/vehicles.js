const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// POST /api/vehicles - Records a new vehicle entry
router.post('/', async (req, res) => {
    const { vehicleNumber, vehicleType, reservationType } = req.body;
    try {
        const newVehicle = new Vehicle({
            vehicleNumber,
            vehicleType,
            reservationType,
            entryTime: new Date() // Set entry time on the server
        });
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/vehicles - Fetches all vehicles
router.get('/', async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ entryTime: -1 }); // Sort by most recent
        res.json(vehicles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/vehicles/:id - Marks a vehicle as exited
router.put('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ msg: 'Vehicle not found' });
        }

        // Only update if not already exited
        if (!vehicle.exitTime) {
            vehicle.exitTime = new Date();
            // Calculate duration in hours (optional)
            const durationMillis = vehicle.exitTime - vehicle.entryTime;
            vehicle.durationHours = Math.round((durationMillis / (1000 * 60 * 60)) * 100) / 100; // aporox 2 decimal places
        }

        await vehicle.save();
        res.json(vehicle);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// DELETE /api/vehicles/:id - Deletes a vehicle log
router.delete('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ msg: 'Vehicle not found' });
        }
        await vehicle.deleteOne();
        res.json({ msg: 'Vehicle log removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;