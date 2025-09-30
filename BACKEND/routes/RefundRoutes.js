const express = require("express");
const router = express.Router();
//insert model
const Refund = require("../Model/RefundModel");
//insert controller
const RefundController = require("../Controllers/RefundControllers");

router.get("/",RefundController.getAllRefunds);
router.post("/",RefundController.addRefunds);
router.get("/:id",RefundController.getByIdRefund);
router.put("/:id",RefundController.updateRefund);
router.delete("/:id",RefundController.deleteRefund);

//export
module.exports = router;