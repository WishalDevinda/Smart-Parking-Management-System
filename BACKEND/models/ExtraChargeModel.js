//add mongoose
const mongoose = require("mongoose");
//mongoose assign schema
const Schema = mongoose.Schema;
//create function
const extrachargeSchema = new Schema({
    extrarateID:{
        type:String,//datatype
        required:true,//validate
    },
    vehicleType:{
        type:String,//datatype
        required:true,//validate
    },
    extrarate:{
        type:Number,//datatype
        required:true,//validate
    },
});
//export the model class
module.exports = mongoose.model(
    "ExtraChargeModel",//filename
    extrachargeSchema //function name
);