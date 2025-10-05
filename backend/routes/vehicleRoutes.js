//decalring variables to import packeges
const router = require("express").Router();
const { registerVehicle } = require("../controllers/vehicleController");

//creating routes for vehicle
router.post("/add", registerVehicle);

/*
router.get("/getAll", controller.getAllVehicles);
router.get("/get/id:", controller.getVehicleByID);
router.put("/update/id:", controller.updateVehicle);
router.delete("/delete/id:", controller.deleteVehicle);
*/

//export the routers
module.exports = router;