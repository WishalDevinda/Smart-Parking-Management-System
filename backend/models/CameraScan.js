const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const DetectedVehicleSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, required: true },
    confidenceScore: { type: Number, required: true }
}, {_id: false});

const CameraScanSchema = new mongoose.Schema({
    scanID: { type: Number },
    timestamp: { type: Date, default: Date.now },
    detectedVehicles: [DetectedVehicleSchema]
}, { timestamps: true });

CameraScanSchema.plugin(AutoIncrement, { inc_field: 'scanID', id: 'scan_counter', start_seq: 1 });

module.exports = mongoose.model('CameraScan', CameraScanSchema);

