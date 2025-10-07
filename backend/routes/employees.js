const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find().select('-password');
        res.json(employees);
    } catch (err) { res.status(500).send('Server Error'); }
});

// POST a new employee
// POST a new employee (CORRECTED VERSION)
router.post('/', async (req, res) => {
    try {
        const { emailAddress, NIC } = req.body;

        // --- CHANGE #1: Simplified and corrected the duplicate check logic ---
        // We build a query to find a document where EITHER the emailAddress OR the NIC matches.
        const orQuery = [{ emailAddress }];
        if (NIC) {
            orQuery.push({ NIC });
        }
        
        const existingEmployee = await Employee.findOne({ $or: orQuery });
        
        if (existingEmployee) {
            return res.status(400).json({ msg: 'Employee with this email or NIC already exists' });
        }
        
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        
        // Respond with the newly created employee (minus the password)
        const employeeToReturn = newEmployee.toObject();
        delete employeeToReturn.password;
        res.status(201).json(employeeToReturn);

    } catch (err) { 
        // --- CHANGE #2: Added console.error to log the actual error to the terminal ---
        console.error("ERROR CREATING EMPLOYEE:", err); // This will show you the real error!
        res.status(500).send('Server Error'); 
    }
});

// PUT (update) an employee
router.put('/:id', async (req, res) => {
    try {
        const { password, ...otherFields } = req.body;
        let employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ msg: 'Employee not found' });

        Object.assign(employee, otherFields);

        if (password && password.length > 0) {
            employee.password = password;
        }

        await employee.save();
        res.json(employee);
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE an employee
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ msg: 'Employee not found' });
        res.json({ msg: 'Employee removed' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;

