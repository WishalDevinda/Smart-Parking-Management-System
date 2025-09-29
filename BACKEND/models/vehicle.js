//declaring variables to assign installed packeges
const mongoose = require("mongoose");

//create a new mongoose schema
const VehicleSchema = new mongoose.Schema(
  {
    //vehicleID
    vehicleID: { 
        type: String, 
        unique: true, 
        index: true, 
        //required: true 
    },

    //vehicleNumber
    vehicleNumber: { 
        type: String, 
        //required: true, 
        trim: true 
    },
    
    //vehicleType
    vehicleType: { 
        type: String, 
        //required: true 
    },

    //date
    date: {
        type: String,
        required: true
    },

    //entryTime
    entryTime: { 
        type: String,
        required: true
    },

    //exitTime
    exitTime: { 
        type: String,
        default: null
    },

    //duration
    duration: {
        type: Number,
        default: null
    },

    // slotID(foreign key)
    slotID: { 
        type: String,
        default: null, 
        ref: "Slot" 
    },
  }
);

//export the vehicle model
module.exports = mongoose.model("Vehicle", VehicleSchema);
