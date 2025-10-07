const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// @route   POST api/incidents
// @desc    Create a new incident manually
router.post('/', async (req, res) => {
    try {
        const newIncident = new Incident(req.body);
        await newIncident.save();
        res.status(201).json(newIncident);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/incidents
// @desc    Get all incidents
router.get('/', async (req, res) => {
    try {
        // .populate() will fetch the assigned officer's details (name only) from the SecurityOfficer collection
        const incidents = await Incident.find().populate('assignedOfficer', 'name').sort({ timestamp: -1 });
        res.json(incidents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/incidents/:id
// @desc    Update an incident (for assigning officers, changing status, etc.)
router.put('/:id', async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!incident) {
            return res.status(404).json({ msg: 'Incident not found' });
        }
        res.json(incident);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/incidents/:id
// @desc    Delete an incident
router.delete('/:id', async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(req.params.id);
        if (!incident) {
            return res.status(404).json({ msg: 'Incident not found' });
        }
        res.json({ msg: 'Incident removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

