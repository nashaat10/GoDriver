import User from "../models/User"; // Import the User model
import { validationResult } from "express-validator"; // For request validation
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

// Create a new user
export const createUser = catchAsync(async (req, res, next) => {
  const user = await User.create({ role: "user" }, req.body);
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
  if (role === "driver" && !vehicleId) {
    return next(new AppError("Vehicle ID is required for drivers", 400));
  }
  res.status(201).json({
    message: "User created successfully",
    user: newUser,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(); // Retrieve all users
  if (!users) {
    return next(new AppError("No users found", 404));
  }
  res.status(200).json(users);
});

export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json(user);
});

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    { role: "user" },
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (role === "driver") {
    user.vehicleId = vehicleId || user.vehicleId;
  }

  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete({ role: "user" }, req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isDeleted = true; // Soft delete by marking the user as deleted
  await user.save();

  res.status(200).json({ message: "User deleted successfully" });
});
