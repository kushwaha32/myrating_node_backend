

const mongoose = require("mongoose")

const userProffessionSchema = new mongoose.Schema({
    proffession: {
        type: String,
        required: [true, "Please provide the proffession"],
        unique: true
    }
}, { timestamps: true })


const UserProffession = mongoose.model("UserProffession", userProffessionSchema);

module.exports = UserProffession;