// backend/controllers/systemHardwareController.js
const SystemHardware = require("../models/systemHardware");

/* --------------------------- helper functions --------------------------- */

// Sri Lanka time (+5:30) based ID like: H1696422330123
const generateHardwareID = () => "H" + (Date.now() + 19800000).toString();

const generateDateYYYYMMDD = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

/* -------------------------------- CREATE -------------------------------- */

const addSystemHardware = async (req, res) => {
  try {
    const { hardwareName, hardwareType } = req.body;

    if (!hardwareName || !hardwareType) {
      return res
        .status(400)
        .json({ message: "hardwareName and hardwareType are required", status: "error" });
    }

    const doc = new SystemHardware({
      hardwareID: req.body.hardwareID || generateHardwareID(),
      hardwareName,
      hardwareType,
      implementedDate:
        req.body.implementedDate || req.body.implementDate || generateDateYYYYMMDD(),
      lastMaintenanceDate: null,
      lastMaintanceDate: null, // keep legacy in sync
      hardwareStatus: "Active",
    });

    const saved = await doc.save();
    return res
      .status(201)
      .json({ message: "System Hardware Added Successfully", systemHardware: saved, status: "success" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in adding system hardware", error: error.message, status: "error" });
  }
};

/* -------------------------------- READ --------------------------------- */

// GET all
const getAllSystemHardwares = async (_req, res) => {
  try {
    const systemHardwares = await SystemHardware.find().sort({ implementedDate: -1 });
    return res.status(200).json({
      message: "System Hardwares Retrieved Successfully",
      systemHardware: systemHardwares,
      count: systemHardwares.length,
      status: "success",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in retrieving system hardwares", status: "error", error: error.message });
  }
};

// GET by hardwareID
const getSystemHardwareByID = async (req, res) => {
  try {
    const hardwareID = req.params.hardwareID || req.body.hardwareID || req.query.hardwareID;
    if (!hardwareID) {
      return res.status(400).json({ message: "hardwareID is required", status: "error" });
    }
    const systemHardware = await SystemHardware.findOne({ hardwareID });
    if (!systemHardware) {
      return res
        .status(404)
        .json({ message: "System Hardware Not Found", status: "error", systemHardware: null });
    }
    return res
      .status(200)
      .json({ message: "System Hardware Retrieved Successfully", systemHardware, status: "success" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in retrieving system hardware", status: "error", error: error.message });
  }
};

/* -------------------------------- UPDATE -------------------------------- */

// PUT/PATCH by hardwareID
const updateSystemHardware = async (req, res) => {
  try {
    const hardwareID = req.params.hardwareID || req.body.hardwareID || req.query.hardwareID;
    if (!hardwareID) {
      return res.status(400).json({ message: "hardwareID is required", status: "error" });
    }

    // Allow these fields
    const {
      hardwareName,
      hardwareType,
      hardwareStatus,
      lastMaintenanceDate,
      lastMaintanceDate, // legacy spelling accepted
    } = req.body;

    const updates = {};
    if (typeof hardwareName === "string" && hardwareName.trim()) updates.hardwareName = hardwareName.trim();
    if (typeof hardwareType === "string" && hardwareType.trim()) updates.hardwareType = hardwareType.trim();
    if (typeof hardwareStatus === "string" && hardwareStatus.trim())
      updates.hardwareStatus = hardwareStatus.trim();

    // Normalize last maintenance date (support both spellings)
    const lm =
      lastMaintenanceDate ??
      lastMaintanceDate ??
      null;
    if (lm !== undefined) {
      updates.lastMaintenanceDate = lm;
      updates.lastMaintanceDate = lm; // keep legacy in sync for old docs/UI
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update", status: "error" });
    }

    const updated = await SystemHardware.findOneAndUpdate(
      { hardwareID },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "System Hardware Not Found", status: "error" });
    }

    return res
      .status(200)
      .json({ message: "System Hardware Updated Successfully", systemHardware: updated, status: "success" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in updating system hardware", status: "error", error: error.message });
  }
};

/* -------------------------------- DELETE -------------------------------- */

const deleteSystemHardware = async (req, res) => {
  try {
    const hardwareID = req.params.hardwareID || req.body.hardwareID || req.query.hardwareID;
    if (!hardwareID) {
      return res.status(400).json({ message: "hardwareID is required", status: "error" });
    }
    const deleted = await SystemHardware.findOneAndDelete({ hardwareID });
    if (!deleted) {
      return res.status(404).json({ message: "System Hardware Not Found", status: "error" });
    }
    return res
      .status(200)
      .json({ message: "System Hardware Deleted Successfully", systemHardware: deleted, status: "success" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in deleting system hardware", status: "error", error: error.message });
  }
};

module.exports = {
  addSystemHardware,
  getAllSystemHardwares,
  getSystemHardwareByID,
  updateSystemHardware,
  deleteSystemHardware,
};
