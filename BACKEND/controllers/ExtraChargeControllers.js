const ExtraCharge = require("../Model/ExtraChargeModel");//connect model class

//create function for display data
const getAllExtraCharges = async (req, res, next) => {

    let extracharge;//assign variable
    //get all extra charges
    try{
        extracharge = await ExtraCharge.find();
    }catch (err){
        console.log(err);
    }
    //not found
    if(!extracharge){
        return res.status(404).json({message:"Extra Charge not found"});
    }
    //display all extra charges
    return res.status(200).json({extracharge});
};

//data insert function
const addExtraRates = async (req, res, next) => {
    const {extrarateID,vehicleType,extrarate} = req.body;
    //create variable
    let extracharge;

    try {
        extracharge = new ExtraCharge({extrarateID,vehicleType,extrarate});
        await extracharge.save(); //save to DB
    }catch (err) {
        console.log(err);
    }
    //not insert extra charges
    if(!extracharge) {
        return res.status(404).json({message:"unable to add extra charges"});
    }
    return res.status(200).json({extracharge});
};

//get by id
const getByIdExtraCharge = async (req, res, next) => { //create function
    const id = req.params.id;//display details using by ID

    let extracharge;//create variable

    try{
        extracharge = await ExtraCharge.findById(id);//check if have extra charge details
    }catch (err) {
        console.log(err);//error display
    }
    //not available extra charges
    if(!extracharge) {
        return res.status(404).json({message:"Extra charges not found"});
    }
    return res.status(200).json({ extracharge });//available extra charges
};

//update rate details
const updateExtraCharge = async (req, res, next) => {
    const id = req.params.id;
    const {extrarateID,vehicleType,extrarate} = req.body;
    //create variable
    let extracharge;

    try{
        extracharge = await ExtraCharge.findByIdAndUpdate(id,
            {extrarateID:extrarateID,vehicleType:vehicleType,extrarate:extrarate});
            extracharge = await extracharge.save();
    }catch (err) {
        console.log(err);
    }
    //not available rates
    if(!extracharge) {
        return res.status(404).json({message:"Unable to Update Extra Charge Details"});
    }
    return res.status(200).json({ extracharge });
};

//delete extra charges
const deleteExtraCharge = async (req, res, next) => {
    const id = req.params.id;

    let extracharge;

    try{
        extracharge = await ExtraCharge.findByIdAndDelete(id)
    }catch (err) {
        console.log(err);
    }
    if(!extracharge) {
        return res.status(404).json({message:"Unable to Delete Extra Charge Details"});
    }
    return res.status(200).json({ extracharge });
};

//export to route
exports.getAllExtraCharges = getAllExtraCharges;
exports.addExtraRates = addExtraRates;
exports.getByIdExtraCharge = getByIdExtraCharge;
exports.updateExtraCharge = updateExtraCharge;
exports.deleteExtraCharge = deleteExtraCharge;