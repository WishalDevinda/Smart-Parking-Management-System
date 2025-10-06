import { Router } from 'express';
import Slot from '../models/Slot.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Create slot
router.post('/', requireAuth, async (req, res) => {
  const { slotId } = req.body;
  if (!slotId) return res.status(400).json({ message: 'slotId required' });
  const exists = await Slot.findOne({ slotId });
  if (exists) return res.status(409).json({ message: 'Slot already exists' });
  const slot = await Slot.create({ slotId });
  req.sse.broadcast('slot_created', slot);
  res.status(201).json(slot);
});

// List / search
router.get('/', requireAuth, async (req, res) => {
  const q = req.query.q;
  const filter = q ? { slotId: new RegExp(q, 'i') } : {};
  const slots = await Slot.find(filter).sort({ slotId: 1 });
  res.json(slots);
});

// Update slotId
router.put('/:id', requireAuth, async (req, res) => {
  const { slotId } = req.body;
  const slot = await Slot.findByIdAndUpdate(req.params.id, { slotId }, { new: true });
  if (!slot) return res.status(404).json({ message: 'Not found' });
  req.sse.broadcast('slot_updated', slot);
  res.json(slot);
});

// Delete
router.delete('/:id', requireAuth, async (req, res) => {
  const slot = await Slot.findByIdAndDelete(req.params.id);
  if (!slot) return res.status(404).json({ message: 'Not found' });
  req.sse.broadcast('slot_deleted', { id: req.params.id, slotId: slot.slotId });
  res.json({ ok: true });
});

async function recordEvent(slot, type, fields = {}) {
  slot.history.push({ type, at: new Date() });
  Object.assign(slot, fields);
  await slot.save();
  return slot;
}

// Actions
router.post('/:id/checkin', requireAuth, async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: 'Not found' });
  if (slot.status === 'occupied') return res.status(400).json({ message: 'Already occupied' });
  await recordEvent(slot, 'checkin', { status: 'occupied', lastCheckIn: new Date() });
  req.sse.broadcast('slot_changed', slot);
  res.json(slot);
});

router.post('/:id/checkout', requireAuth, async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: 'Not found' });
  if (slot.status !== 'occupied') return res.status(400).json({ message: 'Not occupied' });
  await recordEvent(slot, 'checkout', { status: 'available', lastCheckIn: null });
  req.sse.broadcast('slot_changed', slot);
  res.json(slot);
});

router.post('/:id/maintenance/start', requireAuth, async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: 'Not found' });
  if (slot.status === 'maintenance') return res.status(400).json({ message: 'Already in maintenance' });
  await recordEvent(slot, 'maint_start', { status: 'maintenance', lastMaintStart: new Date() });
  req.sse.broadcast('slot_changed', slot);
  res.json(slot);
});

router.post('/:id/maintenance/end', requireAuth, async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: 'Not found' });
  if (slot.status !== 'maintenance') return res.status(400).json({ message: 'Not in maintenance' });
  await recordEvent(slot, 'maint_end', { status: 'available', lastMaintStart: null });
  req.sse.broadcast('slot_changed', slot);
  res.json(slot);
});

// Availability for date/time - simple heuristic based on history
router.get('/search/at', requireAuth, async (req, res) => {
  const { at } = req.query; // ISO date-time
  const atDate = new Date(at || Date.now());
  const slots = await Slot.find().sort({ slotId: 1 });
  const available = [];
  const reserved = [];
  for (const s of slots) {
    // Replay history up to 'at' to determine status
    let status = 'available';
    for (const ev of s.history.filter(h => h.at <= atDate).sort((a,b)=>a.at-b.at)) {
      if (ev.type === 'checkin') status = 'occupied';
      if (ev.type === 'checkout') status = 'available';
      if (ev.type === 'maint_start') status = 'maintenance';
      if (ev.type === 'maint_end') status = 'available';
    }
    if (status === 'available') available.push(s);
    else reserved.push(s);
  }
  res.json({ available, reserved, at: atDate });
});

export default router;
