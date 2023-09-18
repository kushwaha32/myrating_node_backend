const mongoose = require("mongoose");

const brandProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    brandName: {
      type: String,
      required: [true, "Please tell us your Brand Name."],
    },
    brandNameSlug: {
      type: String,
      // required: true,
    },
    brandImage: {
      type: String,
    },

    registeredAs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisteredAs",
      // required: true,
    },

    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Industry",
    },
    location: {
      // GeoJson
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
        // required: [true, "please provide the location"],
      },
      coordinates: {
        type: [Number],
        // required: true,
      },
      address: {
        type: String,
        // required: true,
      },
    },
    acceptTAndC: {
      type: Boolean,
      required: [true, "Please accept our Terms And Condition"],
      default: true,
    },
    acceptPAndP: {
      type: Boolean,
      required: [true, "Please accept our Privacy Policy"],
      default: true,
    },
  },
  { timestamps: true }
);

brandProfileSchema.pre(/^find/, function (next) {
  this.populate("registeredAs").populate("industry");

  next();
});

const BrandProfile = mongoose.model("BrandProfile", brandProfileSchema);

module.exports = BrandProfile;
