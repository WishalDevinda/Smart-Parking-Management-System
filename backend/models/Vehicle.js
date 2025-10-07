// models/Vehicle.js
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const VehicleSchema = new mongoose.Schema({
    // Note: We don't define vehicleID here, the plugin will add it
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, enum: ['Car', 'Motorcycle', 'Van', 'Truck'], required: true },
    date: { type: Date, default: Date.now },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date },
    durationHours: { type: Number },
    reservationType: { type: String }
}, { timestamps: true });

// Attach the auto-increment plugin for a simple numeric ID
VehicleSchema.plugin(AutoIncrement, { inc_field: 'vehicleID' });

module.exports = mongoose.model('Vehicle', VehicleSchema);