//add mongoose
const mongoose = require("mongoose");
//mongoose assign schema
const Schema = mongoose.Schema;
//create function
const refundSchema = new Schema({
    refundID:{
        type:String,//datatype
        required:true,//validate
    },
    reason:{
        type:String,//datatype
        required:true,//validate
    },
    date:{
        type:Date,//datatype
        required:true,//validate
    },
    amount:{
        type:Number,//datatype
        required:true,//validate
    },
    companyAmount:{
        type:Number,//datatype
        required:true,//validate
    },
    status:{
        type:String,//datatype
        required:true,//validate
    },
});
//export the model class
module.exports = mongoose.model(
    "RefundModel",//filename
    refundSchema //function name
);
