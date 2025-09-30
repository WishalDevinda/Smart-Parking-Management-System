// models/vehicle.js
// Purpose: The MongoDB schema used by the controller.

const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    vehicleID: { type: String, unique: true, index: true },
    vehicleNumber: { type: String, trim: true },
    vehicleType: { type: String },
    date: { type: String, required: true },      // YYYY-MM-DD
    entryTime: { type: String, required: true }, // HH:MM:SS
    exitTime: { type: String, default: null },
    duration: { type: Number, default: null },   // hours (float)
    slotID: { type: String, default: null, ref: "Slot" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
