const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee'); // Use the unified Employee model
const auth = require('../middleware/auth');

// @route   POST api/auth/login
// @desc    Authenticate employee & get token
router.post('/login', async (req, res) => {
    const { emailAddress, password } = req.body;
    try {
        let employee = await Employee.findOne({ emailAddress: { $regex: new RegExp(`^${emailAddress}$`, 'i') } });
        if (!employee) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: employee.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/auth/me
// @desc    Get logged in employee data
router.get('/me', auth, async (req, res) => {
    try {
        const employee = await Employee.findById(req.user.id).select('-password');
        res.json(employee);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

