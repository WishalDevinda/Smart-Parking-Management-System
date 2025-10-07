require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSlot = require('./models/ParkingSlot');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');
    
    const totalSlots = await ParkingSlot.countDocuments();
    console.log('Total parking slots in database:', totalSlots);
    
    if (totalSlots > 0) {
      const availableSlots = await ParkingSlot.countDocuments({ isAvailable: true });
      console.log('Available slots:', availableSlots);
      
      const firstFewSlots = await ParkingSlot.find().limit(3);
      console.log('First 3 slots:');
      firstFewSlots.forEach(slot => {
        console.log(`- ${slot.slotId}: ${slot.location}, Available: ${slot.isAvailable}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('Database check completed');
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkDatabase();
