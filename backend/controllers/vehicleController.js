//declaring variables to import packeges
const mongoose = require("mongoose");
const Vehicle = require("../models/vehicle");

//create and define helper functions for the controller functions
//generate a unique vehicle ID
const generateVehicleID = function () {
    const time = (Date.now() + 19800000).toString(); //+5:30 GMT;
    return "V" + time;
}

//generate the current date
const generateDate = function () {
    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const date = new Date().getDate().toString().padStart(2, '0');

    const actualDate = year + "-" + month + "-" + date;
    return actualDate;
}

//generate the current time
const generateTime = function () {
    const localTime = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Colombo",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    })

    return localTime;
}

//calculate duration betweeen entry time and exit time
const calculateDuration = function (entryTime, exitTime) {
    return exitTime - entryTime;
}

//create and define controller functions
const registerVehicle = async function (req, res) {
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
            slotID: "Not Assigned"
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



const finishParking = async function (req, res) {
    try {
        //assign the request body values to variables
        const vehicleID = req.body.vehicleID;

        //fin the vehicle by vehicleID
        const vehicle = await Vehicle.findOne({ vehicleID: vehicleID });
        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found",
                status: "error",
                vehicle: null,
            })
        }

        //using a switch case to determine the reservation type to calculate the payment and exit time
        switch (vehicle.reservationType) {
            case "Online":
                break;

            case "Real-Time":
                //update the vehicle details
                vehicle.exitTime = generateTime();
                vehicle.duration = calculateDuration(vehicle.entryTime, vehicle.exitTime);

                //update the vehicle in the database
                const updateVehicle = await vehicle.save();
                res.status(200).json({
                    message: "vehicle parking finished successfully",
                    vehicle: updateVehicle,
                    status: "success"
                })

                if (!updateVehicle) {
                    return res.status(500).json({
                        message: "Error in finishing vehicle parking",
                        status: "error",
                        vehicle: null
                    })
                }
                break;
        }
    }

    catch (error) {
        //display the error message
        res.status(500).json({
            message: error.message,
            status: "error",
            vehicle: null
        })
    }
}

const getAllVehicles = async function (req, res) {
    try {
        const vehicles = await vehicle.find().sort({ date: -1});
        res.status(200).json({
            message: "Vehicle fetched successfully",
            vehicle: vehicles,
            status: "success"
        })

        if(!vehicles) {
            return res.status(404).json({
                message: "No vehicles found",
                status: "error",
                vehicle: null
            })
        }
    }

    catch {error} {
        //display error message
        res.status(500).json({
            message: error.message,
            status: "error"
        })
    }
}
//export the controller functions
module.exports = { 
    registerVehicle,
    finishParking,
    getAllVehicles
 };