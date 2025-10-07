const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const IncidentSchema = new mongoose.Schema({
    incidentID: { type: Number },
    timestamp: { type: Date, default: Date.now },
    scanID: { type: Number, ref: 'CameraScan' },
    type: { 
        type: String, 
        required: true,
        enum: ['Suspicious Activity', 'Unauthorized Entry', 'Parking Violation', 'Accident', 'Other'] 
    },
    description: { type: String, required: true },
    severity: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical']
    },
    status: {
        type: String,
        required: true,
        enum: ['Open', 'Under Investigation', 'Resolved', 'Closed'],
        default: 'Open'
    },
    assignedOfficer: { 
        type: mongoose.Schema.Types.ObjectId, 
        // --- THIS IS THE FIX ---
        // Changed ref from 'SecurityOfficer' to the correct 'Employee' model
        ref: 'Employee', 
        // ----------------------
        default: null 
    },
    resolutionNotes: { type: String, default: '' }
}, { timestamps: true });

IncidentSchema.plugin(AutoIncrement, { inc_field: 'incidentID', id: 'incident_counter', start_seq: 1 });

module.exports = mongoose.model('Incident', IncidentSchema);
