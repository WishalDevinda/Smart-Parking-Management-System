const express = require("express");
const router = express.Router();
//insert model
const Rate = require("../Model/RateModel");
//insert controller
const RateController = require("../Controllers/RateControllers");

router.get("/",RateController.getAllRates);
router.post("/",RateController.addRates);
router.get("/:id",RateController.getByIdRate);
router.put("/:id",RateController.updateRate);
router.delete("/:id",RateController.deleteRate);

//export
module.exports = router;