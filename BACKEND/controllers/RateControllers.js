const Rate = require("../Model/RateModel");//connect model class

//create function for display data
const getAllRates = async (req, res, next) => {

    let Rates;//assign variable
    //get all rates
    try{
        Rates = await Rate.find();
    }catch (err){
        console.log(err);
    }
    //not found
    if(!Rates){
        return res.status(404).json({message:"Rate not found"});
    }
    //display all rates
    return res.status(200).json({Rates});
};

//data insert function
const addRates = async (req, res, next) => {
    const {rateID,vehicleType,rate} = req.body;
    //create variable
    let rates;

    try {
        rates = new Rate({rateID,vehicleType,rate});
        await rates.save(); //save to DB
    }catch (err) {
        console.log(err);
    }
    //not insert rates
    if(!rates) {
        return res.status(404).json({message:"unable to add rates"});
    }
    return res.status(200).json({rates});
};

//get by id
const getByIdRate = async (req, res, next) => { //create function
    const id = req.params.id;//display details using by ID

    let rate;//create variable

    try{
        rate = await Rate.findById(id);//check if have rate details
    }catch (err) {
        console.log(err);//error display
    }
    //not available rates
    if(!rate) {
        return res.status(404).json({message:"Rate not found"});
    }
    return res.status(200).json({ rate });//available rate
};

//update rate details
const updateRate = async (req, res, next) => {
    const id = req.params.id;
    const {rateID,vehicleType,rate} = req.body;
    //create variable
    let rates;

    try{
        rates = await Rate.findByIdAndUpdate(id,
            {rateID:rateID,vehicleType:vehicleType,rate:rate});
            rates = await rates.save();
    }catch (err) {
        console.log(err);
    }
    //not available rates
    if(!rates) {
        return res.status(404).json({message:"Unable to Update Rate Details"});
    }
    return res.status(200).json({ rates });
};

//delete rate
const deleteRate = async (req, res, next) => {
    const id = req.params.id;

    let rate;

    try{
        rate = await Rate.findByIdAndDelete(id)
    }catch (err) {
        console.log(err);
    }
    if(!rate) {
        return res.status(404).json({message:"Unable to Delete Rate Details"});
    }
    return res.status(200).json({ rate });
};

//export to route
exports.getAllRates = getAllRates;
exports.addRates = addRates;
exports.getByIdRate = getByIdRate;
exports.updateRate = updateRate;
exports.deleteRate = deleteRate;