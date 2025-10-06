// routes/vehicleRoutes.js
const router = require("express").Router();
const {
  registerVehicle,
  finishParkingByVehicleNumber,
  getAllVehicles,
  getHistoryByVehicleNumber,
} = require("../controllers/vehicleController");

router.post("/add", registerVehicle);
router.put("/finish/by-number/:vehicleNumber", finishParkingByVehicleNumber);
router.get("/getAll", getAllVehicles);
router.get("/history/:vehicleNumber", getHistoryByVehicleNumber);

module.exports = router;
