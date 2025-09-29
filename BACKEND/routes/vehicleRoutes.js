// declaring a variable to get the express router function
const router = require("express").Router();
const VehicleController = require("../controllers/vehicleController");

// define routes for vehicle operations
router.post("/", VehicleController.registerVehicle);
router.get("/", VehicleController.getAllVehicles);              // get all vehicles
router.get("/:id", VehicleController.getVehicleByID);           // get vehicle by ID
router.put("/:id", VehicleController.updateVehicle);            // update vehicle
router.delete("/:id", VehicleController.deleteVehicle);         // delete vehicle

// export the router
module.exports = router;