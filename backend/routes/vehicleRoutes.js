// routes/vehicleRoutes.js
const router = require("express").Router();
const {
  registerVehicle,
  finishParkingByVehicleNumber,
  getAllVehicles,
} = require("../controllers/vehicleController");

router.post("/add", registerVehicle);
// finish by vehicleNumber (input from exit counter)
router.put("/finish/by-number/:vehicleNumber", finishParkingByVehicleNumber);
router.get("/getAll", getAllVehicles);

module.exports = router;
