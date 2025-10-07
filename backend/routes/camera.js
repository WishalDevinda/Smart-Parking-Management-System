const express = require('express');
const router = express.Router();
const CameraScan = require('../models/CameraScan');
const Incident = require('../models/Incident');

// @route   POST api/camera/scan
// @desc    Simulates a camera scan, respects the 4-slot limit, and may generate an incident
router.post('/scan', async (req, res) => {
    try {
        // --- VEHICLE DETECTION SIMULATION ---
        const detectedVehicles = [];
        const vehicleTypes = ['Car', 'Motorcycle', 'Van', 'Truck'];
        // MODIFIED: Detect 0 to 4 vehicles to respect the 4-slot limit
        const numVehicles = Math.floor(Math.random() * 5); 

        for (let i = 0; i < numVehicles; i++) {
            detectedVehicles.push({
                vehicleNumber: `ABC-${Math.floor(Math.random() * 9000) + 1000}`,
                vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
                confidenceScore: Math.random() * (0.99 - 0.85) + 0.85
            });
        }
        
        const newScan = new CameraScan({ detectedVehicles });
        await newScan.save();

        // --- INCIDENT DETECTION SIMULATION ---
        // 30% chance of an incident being detected on any given scan.
        if (Math.random() < 0.3) {
            const incidentTypes = ['Suspicious Activity', 'Parking Violation', 'Unauthorized Entry'];
            const severities = ['Low', 'Medium', 'High'];
            const newIncident = new Incident({
                scanID: newScan.scanID,
                type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
                description: `Automatic detection during scan #${newScan.scanID}.`,
                severity: severities[Math.floor(Math.random() * severities.length)]
            });
            await newIncident.save();
        }

        res.status(201).json(newScan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/camera/scans
// @desc    Get all historical scan data
router.get('/scans', async (req, res) => {
    try {
        const scans = await CameraScan.find().sort({ timestamp: -1 });
        res.json(scans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

