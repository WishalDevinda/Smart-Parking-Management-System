//add mongoose
const mongoose = require("mongoose");
//mongoose assign schema
const Schema = mongoose.Schema;
//create function
const paymentSchema = new Schema({
    paymentID:{
        type:String,//datatype
        required:true,//validate
    },
    amount:{
        type:Number,//datatype
        required:true,//validate
    },
    extraAmount:{
        type:Number,//datatype
        required:true,//validate
    },
    total:{
        type:Number,//datatype
        required:true,//validate
    },
    paymentMethod:{
        type:String,//datatype
        required:true,//validate
    },
    date:{
        type:Date,
        required:true,
    },
    status:{
        type:String,//datatype
        required:true,//validate
    },
});
//export the model class
module.exports = mongoose.model(
    "PaymentModel",//filename
    paymentSchema //function name
);