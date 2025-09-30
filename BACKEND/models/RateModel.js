//add mongoose
const mongoose = require("mongoose");
//mongoose assign schema
const Schema = mongoose.Schema;
//create function
const rateSchema = new Schema({
    rateID:{
        type:String,//datatype
        required:true,//validate
    },
    vehicleType:{
        type:String,//datatype
        required:true,//validate
    },
    rate:{
        type:Number,//datatype
        required:true,//validate
    },
});
//export the model class
module.exports = mongoose.model(
    "RateModel",//filename
    rateSchema //function name
);