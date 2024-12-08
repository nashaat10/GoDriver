import User from "../models/UserModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getAllDrivers = catchAsync(async (req, res, next) => {
  const drivers = await User.find({ role: "driver" });
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      drivers,
    },
  });
});

export const getDriver = catchAsync(async (req, res, next) => {
  const driver = await User.findById({ role: "driver" }, req.params.id);
  if (!driver) {
    return next(new AppError("No driver found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      driver,
    },
  });
});

export const createDriver = catchAsync(async (req, res, next) => {
  const driver = await User.create({ role: "driver" }, req.body);
  res.status(201).json({
    status: "success",
    data: {
      driver,
    },
  });
});

export const updateDriver = catchAsync(async (req, res, next) => {
  const driver = await User.findByIdAndUpdate(
    { role: "driver" },
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!driver) {
    return next(new AppError("No driver found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      driver,
    },
  });
});

export const deleteDriver = catchAsync(async (req, res, next) => {
  const driver = await User.findByIdAndDelete(
    { role: "driver" },
    req.params.id
  );
  if (!driver) {
    return next(new AppError("No driver found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
