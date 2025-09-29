// declaring a variable to import the vehicle model file
const Vehicle = require("../models/vehicle");

//helper functions
// create and define a function to generate ID
const generateVehicleID = function () {
    const vehicleID = "V" + Date.now(); // Changed Date.now to Date.now()
    return vehicleID;
};

// create and define a function to generate date
const generateDate = function () {
    const fullDate = new Date();
    const isoString = fullDate.toISOString();
    const dateOnlyString = isoString.slice(0, 10);
    return dateOnlyString; // Need to return the value
};

// create and define a function to generate time
const generateTime = function () {
    const fullDate = new Date();
    const isoString = fullDate.toISOString();
    const timeOnlyString = isoString.slice(11, 19);
    return timeOnlyString; // Need to return the value
};


//controller functions
// registerVehicle
const registerVehicle = async function (req, res) {

    const vehicleNumber = req.body.vehicleNumber;
    const vehicleType = req.body.vehicleType;

    // Check the all fields and present or not
    if (!vehicleNumber || !vehicleType) {
        return res.status(400).json({ error: "Vehicle number and type are required." });
    }

    // Create a new vehicle model instance
    const newVehicle = new Vehicle({
        vehicleID: generateVehicleID(),
        vehicleNumber: vehicleNumber,
        vehicleType: vehicleType,
        date: generateDate(),
        entryTime: generateTime(),
        exitTime: null,
        duration: null,
        slotID: null
    });

    try {
        // Save to the MongoDB database using async/await
        const savedDoc = await newVehicle.save();

        // Send a 201 Created response back to the client on success
        res.status(201).json({
            message: "Vehicle added successfully",
            vehicle: savedDoc
        });

    } catch (err) {
        // Send a 400 Bad Request or 500 Server Error response on failure
        console.error("Database error:", err);
        res.status(400).json({
            error: "Could not save vehicle",
            details: err.message
        });
    }
};

// small helper to find by :id that might be _id or vehicleID
async function findByAnyId(id) {
  const or = [{ vehicleID: id }];
  if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });
  return Vehicle.findOne({ $or: or });
}

// GET /vehicles – get all vehicles
const getAllVehicles = async function (req, res) {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 }); // newest first if timestamps enabled
    res.status(200).json({ count: vehicles.length, vehicles });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to fetch vehicles", details: err.message });
  }
};

// GET /vehicles/:id – get one by _id or vehicleID
const getVehicleByID = async function (req, res) {
  const { id } = req.params;
  try {
    const vehicle = await findByAnyId(id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.status(200).json({ vehicle });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to fetch vehicle", details: err.message });
  }
};

// PUT /vehicles/:id – update simple fields
const updateVehicle = async function (req, res) {
  const { id } = req.params;

  // allow only these fields to be updated (simple & safe)
  const allowed = ["vehicleNumber", "vehicleType", "exitTime", "duration", "slotID"];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }

  try {
    // find target
    const target = await findByAnyId(id);
    if (!target) return res.status(404).json({ error: "Vehicle not found" });

    // apply updates
    Object.assign(target, updates);
    const saved = await target.save();

    res.status(200).json({ message: "Vehicle updated", vehicle: saved });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to update vehicle", details: err.message });
  }
};

// DELETE /vehicles/:id – delete by _id or vehicleID
const deleteVehicle = async function (req, res) {
  const { id } = req.params;
  try {
    const target = await findByAnyId(id);
    if (!target) return res.status(404).json({ error: "Vehicle not found" });

    await target.deleteOne();
    res.status(200).json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to delete vehicle", details: err.message });
  }
};

// export all
module.exports = {
  registerVehicle,
  getAllVehicles,
  getVehicleByID,
  updateVehicle,
  deleteVehicle,
};