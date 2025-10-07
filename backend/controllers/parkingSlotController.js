const ParkingSlot = require('../models/ParkingSlot');

// Get all parking slots
const getAllParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available parking slots
const getAvailableSlots = async (req, res) => {
  try {
    const availableSlots = await ParkingSlot.find({ isAvailable: true });
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get parking slot statistics
const getSlotStatistics = async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ isAvailable: true });
    const reservedSlots = totalSlots - availableSlots;

    res.json({
      totalSlots,
      availableSlots,
      reservedSlots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create parking slot
const createParkingSlot = async (req, res) => {
  try {
    const { slotId, location, floor, section } = req.body;

    // Check if slot already exists
    const existingSlot = await ParkingSlot.findOne({ slotId });
    if (existingSlot) {
      return res.status(400).json({ message: 'Parking slot with this ID already exists' });
    }

    const slot = new ParkingSlot({
      slotId,
      location,
      floor,
      section
    });

    const savedSlot = await slot.save();
    res.status(201).json(savedSlot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update parking slot availability
const updateSlotAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true, runValidators: true }
    );

    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('slotUpdate', { slotId: slot._id, isAvailable });
    }

    res.json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllParkingSlots,
  getAvailableSlots,
  getSlotStatistics,
  createParkingSlot,
  updateSlotAvailability
};
