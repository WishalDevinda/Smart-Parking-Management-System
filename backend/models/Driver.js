const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  driverId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  nic: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('Driver', driverSchema);
