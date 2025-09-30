const slotEvents = require('../utils/slotEvents');
const ParkingSlot = require('../model/ParkingSlot');
const SlotUsage = require('../model/SlotUsage');
const MaintenanceLog = require('../model/MaintenanceLog');

/* crud for slots */

// GET /api/slots?status=available
exports.list = async (req, res) => {
  try {
    const q = req.query.status ? { status: req.query.status } : {};
    const slots = await ParkingSlot.find(q).sort({ slotId: 1 });
    res.json(slots);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/slots/:id
exports.getOne = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Not found' });
    res.json(slot);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/slots
exports.create = async (req, res) => {
  try {
    const slot = await ParkingSlot.create(req.body);
    // broadcast
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, status: slot.status,
      action: 'create', ts: Date.now()
    });
    res.status(201).json(slot);
  } catch (e) {
    // nicer duplicate error for unique slotId
    if (e.code === 11000 && e.keyPattern && e.keyPattern.slotId) {
      return res.status(409).json({ error: 'slotId already exists' });
    }
    res.status(400).json({ error: e.message });
  }
};

// PATCH /api/slots/:id
exports.update = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    if (!slot) return res.status(404).json({ error: 'Not found' });
    // broadcast
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, status: slot.status,
      action: 'update', ts: Date.now()
    });
    res.json(slot);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /api/slots/:id
exports.remove = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Not found' });
    // broadcast
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, action: 'delete', ts: Date.now()
    });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/slots/by-slotId/:slotId
exports.removeBySlotId = async (req, res) => {
  try {
    const slot = await ParkingSlot.findOneAndDelete({ slotId: req.params.slotId });
    if (!slot) return res.status(404).json({ error: 'Not found' });
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, action: 'delete', ts: Date.now()
    });
    res.json({ message: 'Deleted', slotId: req.params.slotId, id: slot._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/*real time operation */

// POST /api/slots/:id/checkin
exports.checkIn = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status !== 'available') {
      return res.status(400).json({ error: `Slot is ${slot.status}, cannot check-in` });
    }

    slot.status = 'occupied';
    slot.lastUpdated = new Date();
    await slot.save();

    await SlotUsage.create({ slot: slot._id });

    // broadcast
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, status: 'occupied',
      action: 'checkin', ts: Date.now()
    });

    res.json({ message: 'Checked in', slotId: slot.slotId, status: slot.status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/slots/:id/checkout
exports.checkOut = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status !== 'occupied') {
      return res.status(400).json({ error: `Slot is ${slot.status}, cannot check-out` });
    }

    const usage = await SlotUsage.findOne({ slot: slot._id, checkOut: null }).sort({ checkIn: -1 });
    if (!usage) return res.status(409).json({ error: 'No open usage session to close' });

    usage.checkOut = new Date();
    usage.durationMins = Math.max(1, Math.round((usage.checkOut - usage.checkIn) / 60000));
    await usage.save();

    slot.status = 'available';
    slot.lastUpdated = new Date();
    await slot.save();

    // broadcast
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, status: 'available',
      action: 'checkout', minutes: usage.durationMins, ts: Date.now()
    });

    res.json({ message: 'Checked out', slotId: slot.slotId, minutes: usage.durationMins });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/slots/:id/maintenance/start
exports.maintenanceStart = async (req, res) => {
  try {
    const { note = '' } = req.body || {};
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status === 'occupied') {
      return res.status(400).json({ error: 'Cannot start maintenance while occupied' });
    }

    slot.status = 'maintenance';
    slot.lastUpdated = new Date();
    await slot.save();

    const log = await MaintenanceLog.create({ slot: slot._id, note });

    // broadcast
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, status: 'maintenance',
      action: 'maintenanceStart', ts: Date.now()
    });

    res.json({ message: 'Maintenance started', slotId: slot.slotId, logId: log._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/slots/:id/maintenance/end
exports.maintenanceEnd = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    const log = await MaintenanceLog.findOne({ slot: slot._id, endAt: null }).sort({ startAt: -1 });
    if (!log) return res.status(409).json({ error: 'No open maintenance to end' });

    log.endAt = new Date();
    await log.save();

    slot.status = 'available';
    slot.lastUpdated = new Date();
    await slot.save();

    // broadcast
    slotEvents.emit('slot-updated', {
      id: slot._id, slotId: slot.slotId, status: 'available',
      action: 'maintenanceEnd', ts: Date.now()
    });

    res.json({ message: 'Maintenance ended', slotId: slot.slotId, logId: log._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



// GET /api/slots/:id/usage   (id is Mongo ObjectId of the slot)
exports.usageBySlot = async (req, res) => {
  try {
    const sessions = await SlotUsage.find({ slot: req.params.id }).sort({ checkIn: -1 });
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/slots/:id/maintenance
exports.maintenanceBySlot = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find({ slot: req.params.id }).sort({ startAt: -1 });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/slots/summary   -> { available, occupied, maintenance }
exports.summary = async (req, res) => {
  try {
    const counts = await ParkingSlot.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const obj = Object.fromEntries(counts.map(c => [c._id, c.count]));
    res.json({
      available: obj.available || 0,
      occupied: obj.occupied || 0,
      maintenance: obj.maintenance || 0
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
