//declaring variables to import packeges
const mongoose = require("mongoose");
const schema = mongoose.Schema;

//create a schema for vehicle collection
const vehicleSchema = new schema({
    vehicleID : { //------------------------------> vehicle ID
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    
    vehicleNumber: { //---------------------------> vehicle number
        type: String,
        require: true,
        unique: true,
        trim:  true
    },

    vehicleType: { //-----------------------------> vehicle type
        type: String,
        require: true,
        trim: true,    
    },

    date: { //--------------------------------------> date
        type: Date,
        require: true,
        trim: true,
        default: Date.now
    },

    entryTime: { //----------------------------------> entry time
        type: Date,
        require: true,
        trim: true,
    },

    exitTime: { //-----------------------------------> exit time
        type: Date,
        require: false,
        trim: true
    },

    duration: { //------------------------------------> duration
        type: Number,
        require: false,
        trim: true
    },

    reservationType: { //---------------------------> reservation type
        type: String,
        require: true,
        trim: true
    }
    })

//convert the schema to a mongoose model
const Vehicle = mongoose.model("Vehicle", vehicleSchema);

//export the model
module.export = Vehicle;