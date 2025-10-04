//declaring variables to import packeges
const mongoose = require("mongoose");
const schema = mongoose.Schema;

//create a schema for system hardware
const systemHardwareSchema = new schema({
    hardwareID: { //----------------------------------> hardware ID
        type: String,
        require: true,
        unique : true,
        trim: true
    },

    hardwareName: { //--------------------------------> hardware name
        type: String,
        require: true,
        unique: false,
        trim: true
    },

    hardwareType: { //--------------------------------> hardware type
        type: String,
        require: true,
        trim: true
    },

    implementedDate: { //-------------------------------> implemented date
        type: Date,
        require: true,
        trim: true,
        default: Date.now
    },
    
    lastMaintanceDate: { //---------------------------> last maintenance date
        type: Date,
        require: false,
        trim: true
    },

    hardwareStatus: { //-----------------------------> hardware status
        type: String,
        require: true,
        trtim: true
    }
})

//convert the schema to a mongoose model
const SystemHardware = mongoose.model("SystemHardware", systemHardwawreSchema);

//export the model
module.exports = SystemHardware;