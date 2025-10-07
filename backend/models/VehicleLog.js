const mongoose = require('mongoose');

const VehicleLogSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    vehicleType: { type: String, enum: ['Car', 'Motorcycle', 'Van', 'Truck'], required: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date, default: null },
    status: { type: String, enum: ['Inside', 'Exited'], default: 'Inside' }
});

module.exports = mongoose.model('VehicleLog', VehicleLogSchema);