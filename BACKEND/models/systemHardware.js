//declaring variables to assign installed packeges
const mongoose = require("mongoose");

//create an new mongoose schema for system hardware
const SystemHardwareSchema = new mongoose.Schema(
    {
        //hardwareID
        hardwareID: {
            type: String,
            unique: true,
            required: true,
            index: true
        },

        //type:
        type: {
            type: String,
            required: true,
            trim: true
        },

        //working status
        status: {
            type: String,
            default: "ACTIVE",
            index: true
        },

        //installed location
        location: {
            type: String,
            default: null
        },
    }
);

//export the schema as a mongoose model
module.exports = mongoose.model("SystemHardware", SystemHardwareSchema);