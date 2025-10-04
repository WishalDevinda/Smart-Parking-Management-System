//declaring variables to import packeges
const router = require("express").Router();
const controller = require("../controllers/systemHardwareController");

//creating routes for system hardware
router.post("/add", controller.addSystemHardware);
router.get("/getAll", controller.getAllSystemHardwares);
router.get("/get/id:", controller.getSystemHardwareByID);
router.put("/update/id:", controller.updateSystemHardware);
router.delete("/delete/id:", controller.deleteSystemHardware);

//export the routers
module.exports = router;