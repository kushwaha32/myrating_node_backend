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
    ownerTitle: {
      type: String,
    },
    ownerName: {
      type: String,
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
      building: {
        type: String,
      },
      street: {
        type: String,
      },
      landmark: {
        type: String,
      },
      area: {
        type: String,
      },
      country: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },
      pinCode: {
        type: String,
      },
    },
    mobileNo: {
      type: String,
    },
    landLine: {
      type: String,
    },
    tollFreeNo: {
      type: String,
    },
    emailId: {
      type: String,
    },
    websites: {
      type: String,
    },
    youtube: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,
    },
    description: { type: String },
    offers: { type: String },
    awartCerRecognitions: { type: String },
    pamentModes: { type: String },
    stablishmentYear: { type: String },
    hoursOfOperation: { type: String },
    keywords: { type: String },
    multiImg: { type: String },
    businessDoc: { type: String },
    idOfAdmin: { type: String },
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
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

brandProfileSchema.pre(/^find/, function (next) {
  this.populate("registeredAs").populate("industry");

  next();
});

// setting the index
brandProfileSchema.index({ location: "2dsphere" });

// virtual populate review
brandProfileSchema.virtual("businessReview", {
  ref: "BusinessReviews",
  foreignField: "businessProfile",
  localField: "_id",
});

// virtual populate likes
// brandProfileSchema.virtual("likes", {
//   ref: "Like",
//   foreignField: "product",
//   localField: "_id",
// });

const BrandProfile = mongoose.model("BrandProfile", brandProfileSchema);

module.exports = BrandProfile;
