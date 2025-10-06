// app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* -------- middleware -------- */
app.use(cors());
app.use(express.json());

/* -------- db -------- */
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌ Missing MONGO_URL in .env");
  process.exit(1);
}
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((e) => {
    console.error("❌ MongoDB error", e.message);
    process.exit(1);
  });

/* -------- routes -------- */
const vehicleRoutes = require("./routes/vehicleRoutes");
const systemHardwareRoutes = require("./routes/systemHardwareRoutes");

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/systemHardwares", systemHardwareRoutes);

/* -------- health & 404 helpers -------- */
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use((req, res) => {
  // Helpful 404 body so you see what path was missed
  res.status(404).json({ message: "Not Found", method: req.method, path: req.originalUrl });
});

/* -------- start -------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));

module.exports = app;
