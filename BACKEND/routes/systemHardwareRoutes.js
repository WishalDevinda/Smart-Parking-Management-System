// routes/systemHardwareRouter.js
const router = require("express").Router();
const SystemHardwareController = require("../controllers/systemHardwareController");

// Create
router.post("/", SystemHardwareController.registerHardware);

// Read
router.get("/", SystemHardwareController.getAllHardware);
router.get("/:id", SystemHardwareController.getHardwareByID);

// Update
router.put("/:id", SystemHardwareController.updateHardware);

// Delete
router.delete("/:id", SystemHardwareController.deleteHardware);

module.exports = router;
