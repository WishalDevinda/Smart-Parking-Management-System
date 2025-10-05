//declaring variables to import packages
const router = require("express").Router();

//import controller functions
const {
    addSystemHardware,
    getAllSystemHardwares,
    getSystemHardwareByID,
    updateSystemHardware,
    deleteSystemHardware,
} = require("../controllers/systemHardwareController");

/* --------------------------- ROUTE DEFINITIONS --------------------------- */

// CREATE → Add new system hardware
router.post("/add", addSystemHardware);

// READ → Get all system hardwares
router.get("/getAll", getAllSystemHardwares);

// READ → Get single system hardware by ID (using param)
router.get("/get/:hardwareID", getSystemHardwareByID);

// UPDATE → Update system hardware by ID (use PUT or PATCH)
router.put("/update/:hardwareID", updateSystemHardware);
router.patch("/update/:hardwareID", updateSystemHardware);

// DELETE → Delete system hardware by ID
router.delete("/delete/:hardwareID", deleteSystemHardware);

/* ------------------------------------------------------------------------- */

//export the router
module.exports = router;