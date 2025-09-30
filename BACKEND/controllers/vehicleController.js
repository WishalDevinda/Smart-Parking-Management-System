// controllers/vehicleController.js
// Purpose: Business logic for vehicles (create, read, update, exit flow)

const Vehicle = require("../models/vehicle");
const mongoose = require("mongoose");

/* ------------------------- small helpers: ids, date, time ------------------------- */

// Generates a simple unique-looking vehicleID. Adequate for this project scope.
const generateVehicleID = () => "V" + Date.now();

// Returns today's date as YYYY-MM-DD (easy to store and query).
const generateDate = () => new Date().toISOString().slice(0, 10);

// Returns current time as HH:MM:SS.
const generateTime = () => new Date().toISOString().slice(11, 19);

/* ----------------------------------- core api ----------------------------------- */

// POST /vehicles
// Creates a new vehicle record using only number and type.
// Automatically sets entry date/time. Exit fields are set later at the counter.
const registerVehicle = async (req, res) => {
  const { vehicleNumber, vehicleType } = req.body;

  if (!vehicleNumber || !vehicleType) {
    return res
      .status(400)
      .json({ error: "Vehicle number and type are required." });
  }

  const doc = new Vehicle({
    vehicleID: generateVehicleID(),
    vehicleNumber,
    vehicleType,
    date: generateDate(),
    entryTime: generateTime(),
    exitTime: null,
    duration: null,
    slotID: null,
  });

  try {
    const saved = await doc.save();
    return res.status(201).json({
      message: "Vehicle added successfully",
      vehicle: saved,
    });
  } catch (err) {
    console.error("DB save error:", err);
    return res.status(400).json({
      error: "Could not save vehicle",
      details: err.message,
    });
  }
};

// Allows lookup by either our custom vehicleID or Mongo's _id.
const findByAnyId = async (id) => {
  const or = [{ vehicleID: id }];
  if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });
  return Vehicle.findOne({ $or: or });
};

// GET /vehicles
// Returns all vehicles, newest first.
const getAllVehicles = async (_req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: vehicles.length, vehicles });
  } catch (err) {
    console.error("DB fetch error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch vehicles", details: err.message });
  }
};

// GET /vehicles/:id
// Fetches one vehicle by vehicleID or _id.
const getVehicleByID = async (req, res) => {
  try {
    const v = await findByAnyId(req.params.id);
    if (!v) return res.status(404).json({ error: "Vehicle not found" });
    return res.status(200).json({ vehicle: v });
  } catch (err) {
    console.error("DB fetch error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch vehicle", details: err.message });
  }
};

// PUT /vehicles/:id
// Updates a limited set of fields. Keeps updates predictable and safe.
const updateVehicle = async (req, res) => {
  const { id } = req.params;

  const allowed = ["vehicleNumber", "vehicleType", "exitTime", "duration", "slotID"];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }

  try {
    const v = await findByAnyId(id);
    if (!v) return res.status(404).json({ error: "Vehicle not found" });
    Object.assign(v, updates);
    const saved = await v.save();
    return res.status(200).json({ message: "Vehicle updated", vehicle: saved });
  } catch (err) {
    console.error("DB update error:", err);
    return res
      .status(500)
      .json({ error: "Failed to update vehicle", details: err.message });
  }
};

// DELETE /vehicles/:id
// Removes a single record by vehicleID or _id.
const deleteVehicle = async (req, res) => {
  try {
    const v = await findByAnyId(req.params.id);
    if (!v) return res.status(404).json({ error: "Vehicle not found" });
    await v.deleteOne();
    return res.status(200).json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error("DB delete error:", err);
    return res
      .status(500)
      .json({ error: "Failed to delete vehicle", details: err.message });
  }
};

/* --------------------------- helpers for exit workflow --------------------------- */

// GET /vehicles/number/:vehicleNumber
// Quick lookup for counter use: find by vehicleNumber string.
const getVehicleByNumber = async (req, res) => {
  try {
    const v = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber });
    if (!v) return res.status(404).json({ error: "Vehicle not found" });
    return res.status(200).json({ vehicle: v });
  } catch (err) {
    console.error("DB fetch error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch vehicle", details: err.message });
  }
};

// Calculates hours parked between the stored entry datetime and now.
// Result is a float with two decimal places.
const computeDurationHours = (dateStr, timeStr) => {
  const entry = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  const ms = Math.max(0, now - entry);
  return +(ms / 3_600_000).toFixed(2);
};

// POST /vehicles/exit
// Given a vehicleNumber, sets exitTime to now and calculates duration.
// Returns the updated vehicle for immediate display/payment.
const exitVehicleByNumber = async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    if (!vehicleNumber) {
      return res.status(400).json({ error: "vehicleNumber is required" });
    }

    const v = await Vehicle.findOne({ vehicleNumber });
    if (!v) return res.status(404).json({ error: "Vehicle not found" });

    v.exitTime = generateTime();
    v.duration = computeDurationHours(v.date, v.entryTime);

    const saved = await v.save();
    return res.status(200).json({ message: "Exit recorded", vehicle: saved });
  } catch (err) {
    console.error("Exit flow error:", err);
    return res
      .status(500)
      .json({ error: "Failed to record exit", details: err.message });
  }
};

/* ----------------------------------- exports ----------------------------------- */
module.exports = {
  registerVehicle,
  getAllVehicles,
  getVehicleByID,
  updateVehicle,
  deleteVehicle,
  getVehicleByNumber,
  exitVehicleByNumber,
};
