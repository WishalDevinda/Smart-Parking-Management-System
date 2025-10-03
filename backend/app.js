//declaring variables to import packages
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");

/*  ==================================
        declaring helper functions
    ==================================  */

const connection = async () => {
    try {
        await(mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }))
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.log("MongoDB connection failed");
        console.log(error); //display the error message
    }
}

/*  =====================
        Import Routes
    =====================  */

//configure the .env file
dotenv.config();

//create an express app
const app = express();

//use middleware for the express app
app.use(cors());
app.use(express.json());

//delclaring a variable to assign the port number
const PORT = process.env.PORT || 5000;

//getting the mongodb connection string from the .env file
const MONGO_URL = process.env.MONGO_URL;

//connect to the database
connection();

//start listing to the defined port
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})

//export the express app
module.exports = app;