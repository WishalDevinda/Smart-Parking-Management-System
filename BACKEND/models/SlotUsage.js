const mongoose = require('mongoose');

const SlotUsageSchema = new mongoose.Schema({
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
  checkIn: { type: Date, default: Date.now },
  checkOut: { type: Date, default: null },
  durationMins: { type: Number, default: null }
}, { timestamps: true });

SlotUsageSchema.index({ slot: 1, checkOut: 1 });

module.exports = mongoose.model('SlotUsage', SlotUsageSchema);
