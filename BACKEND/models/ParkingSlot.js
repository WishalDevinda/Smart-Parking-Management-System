const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true, unique: true },      
  location: { type: String, default: "" },                      
  status: { type: String, enum: ['available','occupied','maintenance'], default: 'available' },
  price: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);
