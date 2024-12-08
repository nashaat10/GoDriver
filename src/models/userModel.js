import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a driver name"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a driver phone number"],
    },
    email: {
      type: String,
      required: [true, "Please provide a driver email"],
    },
    role: {
      type: String,
      enum: ["driver", "client", "manager"],
      default: "driver",
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
    profilePicture: {
      type: String,
      //   required: [true, "Please provide a driver profile picture"],
    },
    vehicleId: {
      type: String,
      required: [true, "Please provide a vehicle ID"],
    },
    clientId: {
      type: String,
      required: [true, "Please provide a client ID"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User = mongoose.model("User", userSchema);

export default User;
