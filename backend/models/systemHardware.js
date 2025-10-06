// backend/models/systemHardware.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// System Hardware schema
const systemHardwareSchema = new Schema(
  {
    hardwareID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    hardwareName: {
      type: String,
      required: true,
      trim: true,
    },

    hardwareType: {
      type: String,
      required: true,
      trim: true,
    },

    // Correct field name
    implementedDate: {
      type: Date,
      required: true,
      default: Date.now,
      trim: true,
    },

    // Correct field name
    lastMaintenanceDate: {
      type: Date,
      required: false,
      default: null,
      trim: true,
    },

    hardwareStatus: {
      type: String,
      required: true,
      trim: true,
      default: "Active",
    },

    // NOTE: temporary legacy field so existing documents still deserialize cleanly.
    // You may drop this from the schema after migrating data.
    lastMaintanceDate: {
      type: Date,
      required: false,
      default: null,
      trim: true,
      select: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("SystemHardware", systemHardwareSchema);
