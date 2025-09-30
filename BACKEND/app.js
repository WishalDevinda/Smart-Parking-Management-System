//declaring variables to assign installed packeges
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//create an express application
const app = express();

//configure the .dotenv file
dotenv.config();

//use middlewares for the express application
app.use(cors());
app.use(express.json());

//import to variables routes
const vehicleRouter = require("./routes/vehicleRoutes");
const systemHardwareRouter = require("./routes/systemHardwareRoutes");

//use routes in app.js
app.use("/vehicles", vehicleRouter);
app.use("/systemHardware", systemHardwareRouter);

//get the mongoDB connection string from the .env file
const MONGO_URL = process.env.MONGO_URL;

//create a connection function to connect to  mongoDB
const connection = async () => { // async function to connect to mongoBD 
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser : true,
            useUnifiedTopology : true,
        });
        console.log("MongoDB connected successfully"); //display a console message if the connection is successful.
    }
    catch (error) {
        console.log("MongoDB connection failed"); 
        console.log(error); //display the error message if the connection fails.
    }
}

//call the connection function to create the mongoDB connection
connection();

//define a port number
const PORT = process.env.PORT || 5000;

//start listening to the defined port
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT); //display a console message
})

//exports the express application
module.exports = app;