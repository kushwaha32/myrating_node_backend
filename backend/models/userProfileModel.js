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
    selfiImg: {
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
    agreeAndDisAgreeOnReview: { type: Boolean, default: true },
    allowPersonalizeAdds: { type: Boolean, default: true },
    allowToSearchMyAccount: { type: Boolean, default: true },
    newOffers: { type: Boolean, default: true },
    nonPersonalizedAdd: { type: Boolean, default: true },
    plateFormUpdateAnnounce: { type: Boolean, default: true },
    preferences: {
      type: String,
    },
    proPrivacy: { type: Boolean, default: true },
    reviewAndVisibility: { type: Boolean, default: true },
    shareLocationToNearProfile: { type: Boolean, default: true },
    submitVerification: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
