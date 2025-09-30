const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema({
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
  startAt: { type: Date, default: Date.now },
  endAt: { type: Date, default: null },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
