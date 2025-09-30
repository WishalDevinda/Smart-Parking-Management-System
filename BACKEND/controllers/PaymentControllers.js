const Payment = require("../Model/PaymentModel");//connect model class

//create function for display data
const getAllPayments = async (req, res, next) => {

    let Payments;//assign variable
    //get all payments
    try{
        Payments = await Payment.find();
    }catch (err){
        console.log(err);
    }
    //not found
    if(!Payments){
        return res.status(404).json({message:"Payment not found"});
    }
    //display all payments
    return res.status(200).json({Payments});
};

//data insert function
const addPayments = async (req, res, next) => {
    const {paymentID,amount,extraAmount,total,paymentMethod,date,status} = req.body;
    //create variable
    let payments;

    try {
        payments = new Payment({paymentID,amount,extraAmount,total,paymentMethod,date,status});
        await payments.save(); //save to DB
    }catch (err) {
        console.log(err);
    }
    //not insert payments
    if(!payments) {
        return res.status(404).json({message:"unable to add payments"});
    }
    return res.status(200).json({payments});

};

//calculate amount
const calculatePayment = async (req, res, next) => {
    try{
        const{vehicleID} = req.body;

        //find the vehicle
        const vehicle = await Vehicle.findById(vehicleID);
        if(!vehicle) return res.status(404).json({message: "Vehicle not found "});

        //find the rate for relevent vehicle type
        const rates = await RateModel.find({vehicleType: vehicle.vehicleType});
        if(!rates) return res.status(404).json({message: "Rate not found for Vehicle"});

        //calculate amount
        const amount = Numebr(vehicle.duration) * Number(rates.rate);

        //create payment record
        const payment = new Payment({
            amount,
            extraAmount:0,
            paymentMethod:paymentMethod,
            date:new Date(),
            status:"pending",

        });

        await payment.save();
        return res.status(201).json({ message: "Payment calculated & saved", payment});
    }catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error calculating payment" });
    }
};

//get by id
const getById = async (req, res, next) => { //create function
    const id = req.params.id;//display details using by ID

    let payment;//create variable

    try{
        payment = await Payment.findById(id);//check if have payment details
    }catch (err) {
        console.log(err);//error display
    }
    //not available payments
    if(!payment) {
        return res.status(404).json({message:"Payment not found"});
    }
    return res.status(200).json({ payment });//available payment
};

//update payment details
const updatePayment = async (req, res, next) => {
    const id = req.params.id;
    const {paymentID,amount,extraAmount,total,paymentMethod,date,status} = req.body;
    //create variable
    let payments;

    try{
        payments = await Payment.findByIdAndUpdate(id,
            {paymentID:paymentID,amount:amount,extraAmount:extraAmount,total:total,paymentMethod:paymentMethod,date:date,status:status});
            payments = await payments.save();
    }catch (err) {
        console.log(err);
    }
    //not available payments
    if(!payments) {
        return res.status(404).json({message:"Unable to Update Payment Details"});
    }
    return res.status(200).json({ payments });
};

//delete payment
const deletePayment = async (req, res, next) => {
    const id = req.params.id;

    let payment;

    try{
        payment = await Payment.findByIdAndDelete(id)
    }catch (err) {
        console.log(err);
    }
    if(!payment) {
        return res.status(404).json({message:"Unable to Delete Payment Details"});
    }
    return res.status(200).json({ payment });
};

//export to route
exports.getAllPayments = getAllPayments;
exports.addPayments = addPayments;
exports.getById = getById;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;