const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected...')).catch(err => console.error(err));

// --- API ROUTES ---
app.use('/api/employees', require('./routes/employees')); // The single source for all employees
app.use('/api/auth', require('./routes/auth'));
app.use('/api/camera', require('./routes/camera'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/reports', require('./routes/reports'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

