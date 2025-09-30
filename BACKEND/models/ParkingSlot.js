const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  floor: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
