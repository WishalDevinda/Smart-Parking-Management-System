//declaring variables to import packages
const mongoose = require("mongoose");
const Vehicle = require("../models/vehicle");

/* ---------------------- helper functions ---------------------- */

//generate a unique vehicle ID
const generateVehicleID = function () {
    const time = (Date.now() + 19800000).toString(); // +5:30 GMT
    return "V" + time;
};

//generate the current date (YYYY-MM-DD)
const generateDate = function () {
    const d = new Date();
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const date = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${date}`;
};

//generate the current time in Asia/Colombo, 24h HH:MM:SS
const generateTime = function () {
    return new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Colombo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
};

// "HH:MM:SS" -> seconds
function toSeconds(hms) {
    if (typeof hms !== "string") return 0;
    const [h = "0", m = "0", s = "0"] = hms.split(":");
    const hh = parseInt(h, 10) || 0;
    const mm = parseInt(m, 10) || 0;
    const ss = parseInt(s, 10) || 0;
    return hh * 3600 + mm * 60 + ss;
}

// calculate duration (in minutes, rounded up) between entry and exit HH:MM:SS
// handles wrap past midnight (exit < entry)
const calculateDuration = function (entryTime, exitTime) {
    const e = toSeconds(entryTime);
    const x = toSeconds(exitTime);
    const day = 24 * 3600;
    const diff = x >= e ? (x - e) : (x + day - e);
    const minutes = Math.ceil(diff / 60);
    return minutes; // store minutes as duration
};

/* ---------------------- controller functions ---------------------- */

// Register/entry
const registerVehicle = async function (req, res) {
    try {
        const { vehicleNumber, vehicleType, reservationType } = req.body;

        if (!vehicleNumber || !vehicleType || !reservationType) {
            return res.status(400).json({
                message: "vehicleNumber, vehicleType and reservationType are required",
                status: "error",
                vehicle: null,
            });
        }

        const newVehicle = new Vehicle({
            vehicleID: generateVehicleID(),
            vehicleNumber,
            vehicleType,
            date: generateDate(),
            entryTime: generateTime(),
            exitTime: null,
            duration: null, // minutes
            reservationType,
            slotID: "Not Assigned",
        });

        const savedVehicle = await newVehicle.save();

        return res.status(201).json({
            message: "Vehicle registered successfully",
            vehicle: savedVehicle,
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "error",
            vehicle: null,
        });
    }
};

// Exit / finish
const finishParking = async function (req, res) {
    try {
        const { vehicleID } = req.body; // or req.params if you pass it in the URL

        if (!vehicleID) {
            return res.status(400).json({
                message: "vehicleID is required",
                status: "error",
                vehicle: null,
            });
        }

        const vehicle = await Vehicle.findOne({ vehicleID });
        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found",
                status: "error",
                vehicle: null,
            });
        }

        // optional: prevent double-finish
        if (vehicle.exitTime) {
            return res.status(400).json({
                message: "Vehicle already finished parking",
                status: "error",
                vehicle,
            });
        }

        const realExitTime = generateTime();
        const durationMinutes = calculateDuration(vehicle.entryTime, realExitTime);

        vehicle.exitTime = realExitTime;
        vehicle.duration = durationMinutes;

        const updatedVehicle = await vehicle.save();

        return res.status(200).json({
            message: "Vehicle parking finished successfully",
            vehicle: updatedVehicle,
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "error",
            vehicle: null,
        });
    }
};

// List all vehicles
const getAllVehicles = async function (req, res) {
    try {
        const vehicles = await Vehicle.find().sort({ date: -1, entryTime: -1 });

        return res.status(200).json({
            message: "Vehicles fetched successfully",
            vehicle: vehicles,
            count: vehicles.length,
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "error",
        });
    }
};

module.exports = {
    registerVehicle,
    finishParking,
    getAllVehicles,
};
