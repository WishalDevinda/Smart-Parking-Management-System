import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['checkin', 'checkout', 'maint_start', 'maint_end'], required: true },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const slotSchema = new mongoose.Schema(
  {
    slotId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    lastCheckIn: { type: Date },
    lastMaintStart: { type: Date },
    history: [eventSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Slot', slotSchema);
