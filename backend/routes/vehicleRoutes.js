//declaring variables to import packages
const router = require("express").Router();

//import controller functions
const {
    registerVehicle,
    finishParking,
    getAllVehicles,
} = require("../controllers/vehicleController");

/* --------------------------- ROUTE DEFINITIONS --------------------------- */

// CREATE → Register a new vehicle (entry)
router.post("/add", registerVehicle);

// UPDATE → Finish parking by vehicleID (exit)
// using :vehicleID instead of generic :id for clarity
router.put("/finish/:vehicleID", finishParking);

// READ → Get all registered vehicles
router.get("/getAll", getAllVehicles);

/* ------------------------------------------------------------------------- */

//export the router
module.exports = router;