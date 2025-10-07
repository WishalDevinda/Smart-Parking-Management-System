require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSlot = require('./models/ParkingSlot');
const Driver = require('./models/Driver');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedParkingSlots = async () => {
  try {
    // Clear existing slots
    await ParkingSlot.deleteMany({});
    
    const slots = [
      // Floor 1 - Section A
      { slotId: 'A001', location: 'Ground Floor - Section A', floor: '1', section: 'A' },
      { slotId: 'A002', location: 'Ground Floor - Section A', floor: '1', section: 'A' },
      { slotId: 'A003', location: 'Ground Floor - Section A', floor: '1', section: 'A' },
      { slotId: 'A004', location: 'Ground Floor - Section A', floor: '1', section: 'A' },
      { slotId: 'A005', location: 'Ground Floor - Section A', floor: '1', section: 'A' },
      
      // Floor 1 - Section B
      { slotId: 'B001', location: 'Ground Floor - Section B', floor: '1', section: 'B' },
      { slotId: 'B002', location: 'Ground Floor - Section B', floor: '1', section: 'B' },
      { slotId: 'B003', location: 'Ground Floor - Section B', floor: '1', section: 'B' },
      { slotId: 'B004', location: 'Ground Floor - Section B', floor: '1', section: 'B' },
      { slotId: 'B005', location: 'Ground Floor - Section B', floor: '1', section: 'B' },
      
      // Floor 2 - Section A
      { slotId: 'A101', location: 'Second Floor - Section A', floor: '2', section: 'A' },
      { slotId: 'A102', location: 'Second Floor - Section A', floor: '2', section: 'A' },
      { slotId: 'A103', location: 'Second Floor - Section A', floor: '2', section: 'A' },
      { slotId: 'A104', location: 'Second Floor - Section A', floor: '2', section: 'A' },
      { slotId: 'A105', location: 'Second Floor - Section A', floor: '2', section: 'A' },
      
      // Floor 2 - Section B
      { slotId: 'B101', location: 'Second Floor - Section B', floor: '2', section: 'B' },
      { slotId: 'B102', location: 'Second Floor - Section B', floor: '2', section: 'B' },
      { slotId: 'B103', location: 'Second Floor - Section B', floor: '2', section: 'B' },
      { slotId: 'B104', location: 'Second Floor - Section B', floor: '2', section: 'B' },
      { slotId: 'B105', location: 'Second Floor - Section B', floor: '2', section: 'B' },
    ];

    await ParkingSlot.insertMany(slots);
    console.log(`${slots.length} parking slots seeded successfully`);
  } catch (error) {
    console.error('Error seeding parking slots:', error.message);
  }
};

const seedSampleDrivers = async () => {
  try {
    // Clear existing drivers
    await Driver.deleteMany({});
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const drivers = [
      {
        _id: 'DRV001',
        driverId: 'DRV001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        nic: '123456789V',
        password: hashedPassword
      },
      {
        _id: 'DRV002',
        driverId: 'DRV002',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        nic: '987654321V',
        password: hashedPassword
      },
      {
        _id: 'DRV003',
        driverId: 'DRV003',
        name: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        nic: '456789123V',
        password: hashedPassword
      },
      {
        _id: 'DRV004',
        driverId: 'DRV004',
        name: 'Alice Brown',
        email: 'alice.brown@email.com',
        nic: '789123456V',
        password: hashedPassword
      },
      {
        _id: 'DRV005',
        driverId: 'DRV005',
        name: 'Charlie Wilson',
        email: 'charlie.wilson@email.com',
        nic: '321654987V',
        password: hashedPassword
      }
    ];

    await Driver.insertMany(drivers);
    console.log(`${drivers.length} sample drivers seeded successfully`);
    console.log('Sample driver credentials:');
    drivers.forEach(driver => {
      console.log(`- Driver ID: ${driver.driverId}, Email: ${driver.email}, Password: password123`);
    });
  } catch (error) {
    console.error('Error seeding drivers:', error.message);
  }
};

const seedDatabase = async () => {
  await connectDB();
  await seedParkingSlots();
  await seedSampleDrivers();
  
  console.log('\nDatabase seeding completed!');
  console.log('You can now start the application and test with the sample data.');
  process.exit(0);
};

seedDatabase();
