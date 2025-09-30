const Refund = require("../Model/RefundModel");//connect model class

//create function for display data
const getAllRefunds = async (req, res, next) => {

    let refunds;//assign variable
    //get all refunds
    try{
        refunds = await Refund.find();
    }catch (err){
        console.log(err);
    }
    //not found
    if(!refunds){
        return res.status(404).json({message:"Refund not found"});
    }
    //display all refunds
    return res.status(200).json({refunds});
};

//data insert function
const addRefunds = async (req, res, next) => {
    const {refundID,reason,date,amount,companyAmount,status} = req.body;
    //create variable
    let refunds;

    try {
        refunds = new Refund({refundID,reason,date,amount,companyAmount,status});
        await refunds.save(); //save to DB
    }catch (err) {
        console.log(err);
    }
    //not insert refunds
    if(!refunds) {
        return res.status(404).json({message:"unable to add refunds"});
    }
    return res.status(200).json({refunds});
};

//get by id
const getByIdRefund = async (req, res, next) => { //create function
    const id = req.params.id;//display details using by ID

    let refunds;//create variable

    try{
        refunds = await Refund.findById(id);//check if have refund details
    }catch (err) {
        console.log(err);//error display
    }
    //not available refunds
    if(!refunds) {
        return res.status(404).json({message:"Refund not found"});
    }
    return res.status(200).json({ refunds });//available refund
};

//update refund details
const updateRefund = async (req, res, next) => {
    const id = req.params.id;
    const {refundID,reason,date,amount,companyAmount,status} = req.body;
    //create variable
    let refund;

    try{
        refund = await Refund.findByIdAndUpdate(id,
            {refundID:refundID,reason:reason,date:date,amount:amount,companyAmount:companyAmount,status:status});
            refund = await refund.save();
    }catch (err) {
        console.log(err);
    }
    //not available refunds
    if(!refund) {
        return res.status(404).json({message:"Unable to Update Refund Details"});
    }
    return res.status(200).json({ refund });
};

//delete refund
const deleteRefund = async (req, res, next) => {
    const id = req.params.id;

    let refund;

    try{
        refund = await Refund.findByIdAndDelete(id)
    }catch (err) {
        console.log(err);
    }
    if(!refund) {
        return res.status(404).json({message:"Unable to Delete Refund Details"});
    }
    return res.status(200).json({ refund });
};

//export to route
exports.getAllRefunds = getAllRefunds;
exports.addRefunds = addRefunds;
exports.getByIdRefund = getByIdRefund;
exports.updateRefund = updateRefund;
exports.deleteRefund = deleteRefund;