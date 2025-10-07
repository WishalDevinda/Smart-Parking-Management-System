const mongoose = require('mongoose');

const SecurityStaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    shift: { type: String, enum: ['Day', 'Night'], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SecurityStaff', SecurityStaffSchema);