import { VehicleData } from "../models/vehicleData.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// get all vehicle data
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
