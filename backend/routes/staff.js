const express = require('express');
const router = express.Router();
const SecurityStaff = require('../models/SecurityStaff');

// GET /api/staff
router.get('/', async (req, res) => {
    try {
        const staff = await SecurityStaff.find().sort({ createdAt: -1 });
        res.json(staff);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST /api/staff
router.post('/', async (req, res) => {
    try {
        const newStaff = new SecurityStaff(req.body);
        const staff = await newStaff.save();
        res.json(staff);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PUT /api/staff/:id
router.put('/:id', async (req, res) => {
    try {
        const staff = await SecurityStaff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!staff) return res.status(404).json({ msg: 'Staff member not found' });
        res.json(staff);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE /api/staff/:id
router.delete('/:id', async (req, res) => {
    try {
        const staff = await SecurityStaff.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ msg: 'Staff member not found' });
        res.json({ msg: 'Staff member removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;