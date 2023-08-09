

const mongoose = require("mongoose");
 

const emailOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide your email id"]
    },
    otp: {
        type: String,
        required: [true, "Please provide the OTP"]
    },
    createdAt: { type: Date, default: Date.now, index: { expires: 600 } }
    
    // after 5 minutes it deleted automatically from the database

}, { timestamps : true});


const EmailOtp = mongoose.model("EmailOtp", emailOtpSchema);

module.exports = EmailOtp;