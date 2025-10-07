const express = require('express');
const router = express.Router();
const CameraScan = require('../models/CameraScan');
const Incident = require('../models/Incident');

// @route   POST api/reports/generate
// @desc    Generate a report for a specific date range
router.post('/generate', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ msg: 'Please provide both a start and end date.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day

        // Fetch scans and incidents within the date range
        const scans = await CameraScan.find({ timestamp: { $gte: start, $lte: end } });
        const incidents = await Incident.find({ timestamp: { $gte: start, $lte: end } }).populate('assignedOfficer', 'name');

        res.json({ scans, incidents });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

