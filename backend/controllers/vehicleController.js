// controllers/vehicleController.js
const Vehicle = require("../models/vehicle");

/* ---------------- helpers ---------------- */
const generateVehicleID = () => "V" + (Date.now() + 19800000); // +5:30
const generateDate = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const generateTime = () =>
  new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const toSeconds = (hms) => {
  if (typeof hms !== "string") return 0;
  const [h = "0", m = "0", s = "0"] = hms.split(":");
  return (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
};
const calculateDuration = (entryTime, exitTime) => {
  const e = toSeconds(entryTime);
  const x = toSeconds(exitTime);
  const day = 24 * 3600;
  const diff = x >= e ? x - e : x + day - e;
  return Math.ceil(diff / 60); // minutes
};

/* ---------------- controllers ---------------- */

// POST /api/vehicles/add
exports.registerVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, reservationType } = req.body;
    if (!vehicleNumber || !vehicleType || !reservationType) {
      return res.status(400).json({
        message: "vehicleNumber, vehicleType and reservationType are required",
        status: "error",
      });
    }

    const normalizedNumber = vehicleNumber.trim().toUpperCase();

    const vehicle = await Vehicle.create({
      vehicleID: generateVehicleID(),
      vehicleNumber: normalizedNumber,
      vehicleType,
      date: generateDate(),
      entryTime: generateTime(),
      exitTime: null,
      duration: null,
      reservationType,
      slotID: "Not Assigned",
    });

    res
      .status(201)
      .json({ message: "Vehicle registered successfully", vehicle, status: "success" });
  } catch (err) {
    res.status(500).json({ message: err.message, status: "error" });
  }
};

// PUT /api/vehicles/finish/by-number/:vehicleNumber
exports.finishParkingByVehicleNumber = async (req, res) => {
  try {
    const vehicleNumber =
      (req.params.vehicleNumber || req.body.vehicleNumber || "").trim().toUpperCase();

    if (!vehicleNumber) {
      return res
        .status(400)
        .json({ message: "vehicleNumber is required", status: "error" });
    }

    const vehicle = await Vehicle.findOne({ vehicleNumber });
    if (!vehicle)
      return res.status(404).json({ message: "Vehicle not found", status: "error" });

    if (vehicle.exitTime) {
      return res
        .status(400)
        .json({ message: "Vehicle already finished parking", vehicle, status: "error" });
    }

    const realExitTime = generateTime();
    vehicle.exitTime = realExitTime;
    vehicle.duration = calculateDuration(vehicle.entryTime, realExitTime);

    const updated = await vehicle.save();
    res.json({
      message: "Vehicle parking finished successfully",
      vehicle: updated,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: "error" });
  }
};

// GET /api/vehicles/getAll
exports.getAllVehicles = async (_req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ date: -1, entryTime: -1 });
    res.json({
      message: "Vehicles fetched successfully",
      vehicles,
      count: vehicles.length,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: "error" });
  }
};

// GET /api/vehicles/history/:vehicleNumber
exports.getHistoryByVehicleNumber = async (req, res) => {
  try {
    const vehicleNumber = (req.params.vehicleNumber || "").trim().toUpperCase();
    if (!vehicleNumber) {
      return res.status(400).json({ message: "vehicleNumber is required", status: "error" });
    }
    const history = await Vehicle.find({ vehicleNumber })
      .sort({ date: -1, entryTime: -1 });

    res.json({
      message: "History fetched successfully",
      vehicleNumber,
      count: history.length,
      history,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: "error" });
  }
};
