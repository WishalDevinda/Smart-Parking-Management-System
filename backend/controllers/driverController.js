const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');

// Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('-password');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new driver
const createDriver = async (req, res) => {
  try {
    const { driverId, name, email, nic, password } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ 
      $or: [{ email }, { driverId }, { nic }] 
    });
    
    if (existingDriver) {
      return res.status(400).json({ 
        message: 'Driver with this email, driver ID, or NIC already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = new Driver({
      _id: driverId,
      driverId,
      name,
      email,
      nic,
      password: hashedPassword
    });

    const savedDriver = await driver.save();
    
    // Remove password from response
    const { password: _, ...driverResponse } = savedDriver.toObject();
    
    res.status(201).json(driverResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { name, email, nic } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, email, nic },
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login driver with JWT
const loginDriver = async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    const { email, password } = req.body;

    // Find driver by email
    const driver = await Driver.findOne({ email });
    console.log('Driver found:', driver ? 'Yes' : 'No');
    
    if (!driver) {
      console.log('Driver not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log('Checking password...');
    const isPasswordValid = await bcrypt.compare(password, driver.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    console.log('Generating JWT token...');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        driverId: driver.driverId, 
        email: driver.email,
        name: driver.name 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...driverResponse } = driver.toObject();

    console.log('Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      driver: driverResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  loginDriver
};
