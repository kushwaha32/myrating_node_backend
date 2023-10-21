const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Please provide the Profile Name"],
      uniuqe: true,
      minlength: 3,
      lowercase: true,
    },
    productNameSlug: {
      type: String,
      required: [true, "Please provide the Profile Name"],
      uniuqe: true,
      minlength: 3,
      lowercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndustrySubCategory",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Industry",
    },
    bio: {
      type: String,
      required: [true, "Plase provide the bio of the Profile"],
    },
    proifleImg: {
      type: String,
      required: [true, "Please provide the profile image"],
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
    awardCerRecognition: {
      type: String,
    },
    emailId: {
      type: String,
    },
    facebook: {
      type: String,
    },
    hoursOfOperation: {
      type: String,
    },
    instagram: {
      type: String,
    },
    isSameAsAdmin: {
      type: String,
    },
    keywords: {
      type: String,
    },
    landline: {
      type: String,
    },
    mobileNo: {
      type: String,
    },
    multiImg: {
      type: String,
    },
    offer: {
      type: String,
    },
    pamentModes: {
      type: String,
    },
    stablishmentYear: {
      type: String,
    },
    tollFreeNo: {
      type: String,
    },
    twitter: {
      type: String,
    },
    websites: {
      type: String,
    },
    youTube: {
      type: String,
    },
    totalLikes: {
      type: Number,
      min: 0,
      default: 0,
    },
    averageRating: {
      type: Number,
      min: [0, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      default: 0,
    },
    nRating: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// setting the index
productSchema.index({ location: "2dsphere" });

productSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }).populate("subCategory");
  next();
});

// virtual populate review
productSchema.virtual("reviews", {
  ref: "Reviews",
  foreignField: "product",
  localField: "_id",
});

// virtual populate likes
productSchema.virtual("likes", {
  ref: "Like",
  foreignField: "product",
  localField: "_id",
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
