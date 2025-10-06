import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || process.env.MONGODB_DB || 'AutoSlot';
  await mongoose.connect(mongoUri, { dbName });
  const username = process.env.SEED_USERNAME || 'admin';
  const password = process.env.SEED_PASSWORD || 'admin123';
  const existing = await User.findOne({ username });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash, role: 'admin' });
    console.log('Seeded user', username, password);
  } else {
    console.log('User already exists');
  }
  await mongoose.disconnect();
}

run().then(() => process.exit(0));
