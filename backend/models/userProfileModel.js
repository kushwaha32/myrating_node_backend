const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    userImg: {
      type: String,
    },
    verificationId: {
      type: String,
    },
    proffession: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "UserProffession",
    },
    dob: {
      type: String,
      required: [true, "Please provide your Date of birth"],
    },
    location: {
      // GeoJson
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
        required: [true, "please provide the location"],
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    gender: {
      type: String,
      required: [true, "Please select your gender"],
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
