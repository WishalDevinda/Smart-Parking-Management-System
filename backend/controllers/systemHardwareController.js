// importing packages & model
const mongoose = require("mongoose");
const SystemHardware = require("../models/systemHardware");

/* --------------------------- helper functions --------------------------- */

// Sri Lanka time (+5:30) based ID like: H1696422330123
const generateHardwareID = function () {
    const time = (Date.now() + 19800000).toString(); // +5:30 GMT
    return "H" + time;
};

const generateDate = function () {
    const d = new Date();
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const date = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${date}`;
};

/* ------------------------------- CREATE -------------------------------- */

const addSystemHardware = async function (req, res) {
    try {
        const { hardwareName, hardwareType } = req.body;

        if (!hardwareName || !hardwareType) {
            return res.status(400).json({
                message: "hardwareName and hardwareType are required",
                status: "error",
            });
        }

        const newSystemHardware = new SystemHardware({
            hardwareID: generateHardwareID(),
            hardwareName,
            hardwareType,
            // NOTE: your original had typos: "implementeDate" & "lastMaintanceDate".
            // Keep the field names consistent with your Mongoose schema!
            implementDate: generateDate(), // <- make sure your schema uses implementDate
            lastMaintenanceDate: null,     // <- and lastMaintenanceDate
            hardwareStatus: "Active",
        });

        const saved = await newSystemHardware.save();

        return res.status(201).json({
            message: "System Hardware Added Successfully",
            systemHardware: saved, // return the saved doc (not the model)
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in adding system hardware",
            error: error.message,
            status: "error",
        });
    }
};

/* -------------------------------- READ --------------------------------- */

// GET all
const getAllSystemHardwares = async function (req, res) {
    try {
        const systemHardwares = await SystemHardware.find().sort({ implementDate: -1 });

        // Return empty array with 200 is OK for REST; 404 is not necessary
        return res.status(200).json({
            message: "System Hardwares Retrieved Successfully",
            systemHardware: systemHardwares,
            count: systemHardwares.length,
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in retrieving system hardwares",
            status: "error",
            error: error.message,
        });
    }
};

// GET by hardwareID (accepts param, body, or query for convenience)
const getSystemHardwareByID = async function (req, res) {
    try {
        const hardwareID =
            req.params.hardwareID || req.body.hardwareID || req.query.hardwareID;

        if (!hardwareID) {
            return res.status(400).json({
                message: "hardwareID is required",
                status: "error",
            });
        }

        const systemHardware = await SystemHardware.findOne({ hardwareID });

        if (!systemHardware) {
            return res.status(404).json({
                message: "System Hardware Not Found",
                status: "error",
                systemHardware: null,
            });
        }

        return res.status(200).json({
            message: "System Hardware Retrieved Successfully",
            systemHardware,
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in retrieving system hardware",
            status: "error",
            error: error.message,
        });
    }
};

/* ------------------------------- UPDATE -------------------------------- */

// PUT/PATCH by hardwareID (accepts param, body, or query)
const updateSystemHardware = async function (req, res) {
    try {
        const hardwareID =
            req.params.hardwareID || req.body.hardwareID || req.query.hardwareID;

        if (!hardwareID) {
            return res.status(400).json({
                message: "hardwareID is required",
                status: "error",
            });
        }

        // Only allow certain fields to be updated (whitelist)
        const { hardwareName, hardwareType, hardwareStatus, lastMaintenanceDate } =
            req.body;

        const updates = {};
        if (typeof hardwareName === "string" && hardwareName.trim()) {
            updates.hardwareName = hardwareName.trim();
        }
        if (typeof hardwareType === "string" && hardwareType.trim()) {
            updates.hardwareType = hardwareType.trim();
        }
        if (typeof hardwareStatus === "string" && hardwareStatus.trim()) {
            updates.hardwareStatus = hardwareStatus.trim();
        }
        if (lastMaintenanceDate) {
            // Accept YYYY-MM-DD or Date
            updates.lastMaintenanceDate = lastMaintenanceDate;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided to update",
                status: "error",
            });
        }

        const updated = await SystemHardware.findOneAndUpdate(
            { hardwareID },
            { $set: updates },
            { new: true } // return updated doc
        );

        if (!updated) {
            return res.status(404).json({
                message: "System Hardware Not Found",
                status: "error",
            });
        }

        return res.status(200).json({
            message: "System Hardware Updated Successfully",
            systemHardware: updated,
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in updating system hardware",
            status: "error",
            error: error.message,
        });
    }
};

/* ------------------------------- DELETE -------------------------------- */

// DELETE by hardwareID (accepts param, body, or query)
const deleteSystemHardware = async function (req, res) {
    try {
        const hardwareID =
            req.params.hardwareID || req.body.hardwareID || req.query.hardwareID;

        if (!hardwareID) {
            return res.status(400).json({
                message: "hardwareID is required",
                status: "error",
            });
        }

        const deleted = await SystemHardware.findOneAndDelete({ hardwareID });

        if (!deleted) {
            return res.status(404).json({
                message: "System Hardware Not Found",
                status: "error",
            });
        }

        return res.status(200).json({
            message: "System Hardware Deleted Successfully",
            systemHardware: deleted,
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in deleting system hardware",
            status: "error",
            error: error.message,
        });
    }
};

/* ------------------------------ EXPORTS -------------------------------- */

module.exports = {
    addSystemHardware,
    getAllSystemHardwares,
    getSystemHardwareByID,
    updateSystemHardware,
    deleteSystemHardware,
};
