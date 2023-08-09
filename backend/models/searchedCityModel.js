const mongoose = require("mongoose");


const searchCitySchema = new mongoose.Schema({
    userIp: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        lowercase: true
    }

}, { timestamps: true})


const SearchedCity = mongoose.model("SearchedCity", searchCitySchema);

module.exports = SearchedCity;