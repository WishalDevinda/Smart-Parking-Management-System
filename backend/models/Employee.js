const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const EmployeeSchema = new mongoose.Schema({
    employeeID_num: { type: Number },
    name: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Security', 'Admin', 'Manager'] },
    // Fields that are optional and may not apply to all roles
    age: { type: Number },
    contactNumber: { type: String },
    NIC: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
    shift: { type: String, enum: ['Day', 'Night', 'Half Day'] }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

EmployeeSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

EmployeeSchema.plugin(AutoIncrement, {
    inc_field: 'employeeID_num',
    id: 'employee_counter',
    start_seq: 10001,
});

EmployeeSchema.virtual('employeeID').get(function() {
    return `E${this.employeeID_num}`;
});

module.exports = mongoose.model('Employee', EmployeeSchema);

