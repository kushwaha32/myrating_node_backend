const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    brandProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandProfile",
    },
    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
    },
    proffession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProffession",
    },
    contactNumber: {
      type: String,
      required: [true, "Please provide your Contact Number"],
      unique: true,
    },
    peaches: {
      type: Number,
      min: 0,
      required: true,
      default: 0,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: String,
    role: {
      type: String,
      enum: ["user", "business", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Password and confirm password must be same!",
      },
    },
    verifyForgetPassOtp: {
      type: Boolean,
      default: false,
      select: false,
    },
    verifyBusinessOtp: {
      type: Boolean,
      default: false,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only run this function if the password was actually changed
  if (!this.isModified("password")) return next();

  // hash the password with the const of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("passowrd")) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// query middlewate
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } })
    .populate("brandProfile")
    .populate("userProfile")
    .populate("proffession");
   
  next();
});

// virtual populate
userSchema.virtual("products", {
  ref: "Product",
  foreignField: "user",
  localField: "_id",
});

// virtual populate likes
userSchema.virtual("likes", {
  ref: "Like",
  foreignField: "user",
  localField: "_id",
});

// instance method

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if the user has changed the password after token isue

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // generating the reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // storing the encrypted version token in the database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  // token expired time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // return the non encrypted token
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
