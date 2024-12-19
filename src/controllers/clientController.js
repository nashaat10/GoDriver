import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Client from "../models/clientModel.js";
import User from "../models/userModel.js";

export const createClient = catchAsync(async (req, res, next) => {
  const client = await Client.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      client,
    },
  });
});

export const getAllDriversForClient = catchAsync(async (req, res, next) => {
  const drivers = await User.find({
    role: "driver",
    clientId: req.params.clientId,
  });
  res.status(200).json({
    status: "success",
    results: drivers.length,
    data: {
      drivers,
    },
  });
});

export const getAllManagersForClient = catchAsync(async (req, res, next) => {
  const managers = await User.find({
    role: "manager",
    clientId: req.params.clientId,
  });
  res.status(200).json({
    status: "success",
    results: managers.length,
    data: {
      managers,
    },
  });
});

export const getAllAdminsForClient = catchAsync(async (req, res, next) => {
  const admins = await User.find({
    role: "admin",
    clientId: req.params.clientId,
  });
  res.status(200).json({
    status: "success",
    results: admins.length,
    data: {
      admins,
    },
  });
});
