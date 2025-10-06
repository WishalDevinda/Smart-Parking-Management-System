import { Router } from 'express';
import Slot from '../models/Slot.js';
import { requireAuth } from '../middleware/auth.js';
import { stringify } from 'csv-stringify';
import PDFDocument from 'pdfkit';

const router = Router();

function computeStats(slots, from, to) {
  const result = [];
  const byHour = new Array(24).fill(0);

  for (const s of slots) {
    // Build timeline from history within range
    const events = s.history
      .filter(h => h.at <= to)
      .sort((a, b) => a.at - b.at);
    let status = 'available';
    let lastCheck = from;
    let usage = 0;
    let maint = 0;
    let lastOccupiedStart = null;
    let lastMaintStart = null;
    // Initialize status just before 'from'
    for (const ev of events) {
      if (ev.at < from) {
        if (ev.type === 'checkin') status = 'occupied';
        if (ev.type === 'checkout') status = 'available';
        if (ev.type === 'maint_start') status = 'maintenance';
        if (ev.type === 'maint_end') status = 'available';
        if (ev.type === 'checkin') lastOccupiedStart = ev.at;
        if (ev.type === 'maint_start') lastMaintStart = ev.at;
      }
    }
    // Iterate through events within range
    for (const ev of events) {
      if (ev.at < from) continue;
      const segmentEnd = ev.at;
      if (status === 'occupied') usage += Math.max(0, segmentEnd - lastCheck);
      if (status === 'maintenance') maint += Math.max(0, segmentEnd - lastCheck);
      // Add to hourly buckets
      const incBuckets = (start, end) => {
        const startHour = new Date(start).getHours();
        const endHour = new Date(end).getHours();
        for (let h = startHour; h <= endHour; h++) {
          const segStart = new Date(start); segStart.setHours(h, 0, 0, 0);
          const segEnd = new Date(start); segEnd.setHours(h + 1, 0, 0, 0);
          const a = Math.max(start.getTime(), segStart.getTime());
          const b = Math.min(end.getTime(), segEnd.getTime(), to.getTime());
          if (b > a && status === 'occupied') byHour[h % 24] += (b - a) / 60000; // minutes
        }
      };
      incBuckets(lastCheck, segmentEnd);

      // Apply event
      if (ev.type === 'checkin') { status = 'occupied'; lastOccupiedStart = ev.at; }
      if (ev.type === 'checkout') { status = 'available'; lastOccupiedStart = null; }
      if (ev.type === 'maint_start') { status = 'maintenance'; lastMaintStart = ev.at; }
      if (ev.type === 'maint_end') { status = 'available'; lastMaintStart = null; }
      lastCheck = ev.at;
    }
    // tail from lastCheck to 'to'
    if (status === 'occupied') usage += Math.max(0, to - lastCheck);
    if (status === 'maintenance') maint += Math.max(0, to - lastCheck);
    result.push({ slotId: s.slotId, usageMin: Math.round(usage / 60000), maintenanceMin: Math.round(maint / 60000) });
  }
  // Peak hour determination
  let peakHour = byHour.indexOf(Math.max(...byHour));
  const suggestMore = result.filter(r => r.usageMin > 0).length > 0 && byHour[peakHour] > 60 * 2; // >2 hours aggregate occupancy per hour
  return { result, byHour, peakHour, suggestMore };
}

router.get('/analyze', requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const slots = await Slot.find().sort({ slotId: 1 });
  const stats = computeStats(slots, fromDate, toDate);
  res.json(stats);
});

router.get('/export.csv', requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const slots = await Slot.find().sort({ slotId: 1 });
  const { result } = computeStats(slots, fromDate, toDate);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="autoslot-report.csv"');
  const stringifier = stringify({ header: true, columns: ['slotId', 'usageMin', 'maintenanceMin'] });
  stringifier.pipe(res);
  for (const r of result) stringifier.write(r);
  stringifier.end();
});

router.get('/export.pdf', requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const slots = await Slot.find().sort({ slotId: 1 });
  const { result, peakHour, suggestMore } = computeStats(slots, fromDate, toDate);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="autoslot-report.pdf"');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text('AutoSlot Usage Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Range: ${fromDate.toLocaleString()} - ${toDate.toLocaleString()}`);
  doc.moveDown();
  for (const r of result) {
    doc.text(`${r.slotId}  Usage: ${r.usageMin} min   Maintenance: ${r.maintenanceMin} min`);
  }
  doc.moveDown();
  doc.text(`Peak Hour: ${peakHour}:00 - ${peakHour + 1}:00`);
  doc.text(`Suggestion: ${suggestMore ? 'Consider adding more slots' : 'Current capacity seems sufficient'}`);
  doc.end();
});

export default router;
