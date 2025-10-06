import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import slotRoutes from './routes/slots.js';
import reportRoutes from './routes/reports.js';
import sseRoutes from './routes/sse.js';
import { sseMiddleware } from './sse/hub.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// SSE hub attaches to app
app.use(sseMiddleware);

app.get('/', (req, res) => {
  res.json({ status: 'ok', name: 'AutoSlot API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sse', sseRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || process.env.MONGODB_DB || 'AutoSlot';
  try {
    await mongoose.connect(mongoUri, { dbName });
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
