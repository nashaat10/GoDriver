import { VehicleData } from "../models/vehicleData.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Task from "../models/taskModel.js";

export const getAllVehicleData = catchAsync(async (req, res, next) => {
  const vehicleData = await VehicleData.find();

  if (!vehicleData) {
    return next(new AppError("No vehicle data found", 404));
  }
  res.status(200).json({
    status: "success",
    results: vehicleData.length,
    data: {
      vehicleData,
    },
  });
});

export const getVehicleData = catchAsync(async (req, res, next) => {
  const vehicle_id = req.params.id;
  const vehicleData = await VehicleData.find({ vehicleId: vehicle_id });

  if (!vehicleData) {
    return next(new AppError("No vehicle data found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    length: vehicleData.length,
    data: {
      vehicleData,
    },
  });
});
