// models/vehicle.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Store times as strings ("HH:MM:SS") to match your controller.
// Also fix `required` (it was written as `require` before).
const vehicleSchema = new Schema(
  {
    vehicleID: { type: String, required: true, unique: true, trim: true },
    vehicleNumber: { type: String, required: true, unique: true, trim: true },
    vehicleType: { type: String, required: true, trim: true },

    // YYYY-MM-DD
    date: { type: String, required: true, trim: true },

    // Times as "HH:MM:SS" strings
    entryTime: { type: String, required: true, trim: true },
    exitTime: { type: String, default: null, trim: true },

    // Minutes
    duration: { type: Number, default: null },

    reservationType: { type: String, required: true, trim: true },

    // Optional
    slotID: {
      type: String,
      default: "Not Assigned",
      trim: true,
      ref: "Slot",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
