import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a driver name"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a driver phone number"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide a driver email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      enum: ["driver", "manager", "admin"],
      required: [true, "Please provide a user role"],
    },
    password: {
      type: String,
      required: [true, "Please provide a driver password"],
      min: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role === "driver";
      },
    },
    passwordChangedAt: Date,
    verificationCode: String,
    verificationCodeExpires: Date,
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.id;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createVerificationCode = function () {
  // Generate a 4 digit random number
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  // Hash the code
  this.verificationCode = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
  // Set the expiration date
  console.log(code, this.verificationCode);
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

const User = mongoose.model("User", userSchema);

export default User;
