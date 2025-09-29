// controllers/systemHardwareController.js
const mongoose = require("mongoose");
const SystemHardware = require("../models/SystemHardware");

// ID generator (e.g., H1695970123456)
function generateHardwareID() {
  return "H" + Date.now();
}

// Create (register) hardware
const registerHardware = async (req, res) => {
  try {
    const { type, status, location } = req.body;

    if (!type) {
      return res.status(400).json({ error: "type is required" });
    }

    const hw = new SystemHardware({
      hardwareID: generateHardwareID(),
      type: type.trim(),
      status: status || "ACTIVE",
      location: location || null,
    });

    const saved = await hw.save();
    res.status(201).json({ message: "Hardware added successfully", hardware: saved });
  } catch (err) {
    console.error("DB error:", err);
    res.status(400).json({ error: "Could not save hardware", details: err.message });
  }
};

// Helper: find by either Mongo _id or custom hardwareID
async function findByAnyId(id) {
  const or = [{ hardwareID: id }];
  if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });
  return SystemHardware.findOne({ $or: or });
}

// Read: all hardware
const getAllHardware = async (req, res) => {
  try {
    const list = await SystemHardware.find().sort({ createdAt: -1 });
    res.status(200).json({ count: list.length, hardware: list });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Failed to fetch hardware", details: err.message });
  }
};

// Read: one hardware by id (hardwareID or _id)
const getHardwareByID = async (req, res) => {
  try {
    const item = await findByAnyId(req.params.id);
    if (!item) return res.status(404).json({ error: "Hardware not found" });
    res.status(200).json({ hardware: item });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Failed to fetch hardware", details: err.message });
  }
};

// Update: allow simple field updates
const updateHardware = async (req, res) => {
  try {
    const item = await findByAnyId(req.params.id);
    if (!item) return res.status(404).json({ error: "Hardware not found" });

    const allowed = ["type", "status", "location"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) item[k] = req.body[k];
    }

    const saved = await item.save();
    res.status(200).json({ message: "Hardware updated", hardware: saved });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Failed to update hardware", details: err.message });
  }
};

// Delete
const deleteHardware = async (req, res) => {
  try {
    const item = await findByAnyId(req.params.id);
    if (!item) return res.status(404).json({ error: "Hardware not found" });

    await item.deleteOne();
    res.status(200).json({ message: "Hardware deleted" });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Failed to delete hardware", details: err.message });
  }
};

module.exports = {
  registerHardware,
  getAllHardware,
  getHardwareByID,
  updateHardware,
  deleteHardware,
};
