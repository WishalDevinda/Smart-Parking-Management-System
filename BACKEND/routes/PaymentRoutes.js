const express = require("express");
const router = express.Router();
//insert model
const Payment = require("../Model/PaymentModel");
//insert payment controller
const PaymentController = require("../Controllers/PaymentControllers");

router.get("/",PaymentController.getAllPayments);
router.post("/",PaymentController.addPayments);
router.get("/:id",PaymentController.getById);
router.put("/:id",PaymentController.updatePayment);
router.delete("/:id",PaymentController.deletePayment);

//export
module.exports = router;