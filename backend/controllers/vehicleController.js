//declaring variables to import packeges
const mongoose = require("mongoose");
const Vehicle = require("../models/vehicle");

//create and define helper functions for the controller functions
//generate a unique vehicle ID
const generateVehicleID = function() {
    const time = (Date.now() + 19800000).toString(); //+5:30 GMT;
    return "V" + time;
}

//generate the current date
const generateDate = function() {
    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const date = new Date().getDate().toString().padStart(2, '0');

    const actualDate = year + "-" + month + "-" + date;
    return actualDate;
}

//generate the current time
const generateTime = function() {
    const localTime = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Colombo",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    })

    return localTime;
}

//create and define controller functions
const registerVehicle = async function(req, res) {
    try {
        //assign the request body values to variables
        const vehicleNumber = req.body.vehicleNumber;
        const vehicleType = req.body.vehicleType;
        const reservationType = req.body.reservationType;

        //create a new vehicle model instance
        const newVehicle = new Vehicle({
            vehicleID: generateVehicleID(),
            vehicleNumber: vehicleNumber,
            vehicleType: vehicleType,
            date: generateDate(),
            entryTime: generateTime(),
            exitTime: null,
            duration: null,
            reservationType: reservationType,
            slotID : "Not Assigned"
        })

        //save the new vehicle to the database
        const savedVehicle = await newVehicle.save();
        res.status(201).json({
            message: "Vehicle registered successfully",
            vehicle: savedVehicle,
            status: "success"
        })
    }
    catch (error) {
        //display the error message
        res.status(500).json({
            message: error.message,
            status: "error",
            vehicle: null,
        })
    }
}

//export the controller functions
module.exports = { registerVehicle };