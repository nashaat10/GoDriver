import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getAllDrivers = catchAsync(async (req, res, next) => {
  const drivers = await User.find({ role: "driver" });
  res.status(200).json({
    status: "success",
    results: drivers.length,
    data: {
      drivers,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const createDriver = catchAsync(async (req, res, next) => {
  // const { name, phone, email, vehicleId } = req.body;
  const driver = await User.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      driver,
    },
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const updateDriver = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "name", "phone", "profilePicture");

  const driver = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });
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
  const driver = await User.findByIdAndUpdate(req.params.id, {
    active: false,
    deletedAt: Date.now(),
  });
  if (!driver) {
    return next(new AppError("No driver found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, "name", "email", "profilePicture");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
    deletedAt: Date.now(),
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
