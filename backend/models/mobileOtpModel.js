
const mongoose = require("mongoose");

const mobileOtpScehma = new mongoose.Schema({
     contactNumber: {
        type: String,
        required: [true, "Please provide your contact number"]
     },
     otp: {
        type: String,
        required: [true, "Please provide otp that send to your Contact number"]
     },
     createdAt: { type: Date, default: Date.now, index: { expires: 600 } }

    //  After 5 minutes it deleted automatically from the database

}, { timestamps: true });


const MobileOtp = mongoose.model("MobileOtp", mobileOtpScehma);

module.exports = MobileOtp;
