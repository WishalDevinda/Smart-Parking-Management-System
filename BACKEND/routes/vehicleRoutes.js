// routes/vehicleRoutes.js
// Purpose: HTTP route map for all vehicle-related endpoints.

const router = require("express").Router();
const C = require("../controllers/vehicleController");

// Core CRUD
router.post("/", C.registerVehicle);
router.get("/", C.getAllVehicles);
router.get("/:id", C.getVehicleByID);
router.put("/:id", C.updateVehicle);
router.delete("/:id", C.deleteVehicle);

// Counter workflow
router.get("/number/:vehicleNumber", C.getVehicleByNumber);
router.post("/exit", C.exitVehicleByNumber);

module.exports = router;
