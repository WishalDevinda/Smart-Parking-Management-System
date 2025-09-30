const express = require("express");
const router = express.Router();
//insert model
const ExtraCharge = require("../Model/ExtraChargeModel");
//insert controller
const ExtraChargeControllers = require("../Controllers/ExtraChargeControllers");

router.get("/",ExtraChargeControllers.getAllExtraCharges);
router.post("/",ExtraChargeControllers.addExtraRates);
router.get("/:id",ExtraChargeControllers.getByIdExtraCharge);
router.put("/:id",ExtraChargeControllers.updateExtraCharge);
router.delete("/:id",ExtraChargeControllers.deleteExtraCharge);

//export
module.exports = router;