import { VehicleData } from "../models/vehicleData.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Task from "../models/taskModel.js";

//get only  the last location of all vehicles in the database

export const getLastVehicleData = catchAsync(async (req, res, next) => {
  const vehicleData = await VehicleData.aggregate([
    {
      $sort: { timestamp: -1 },
    },
    {
      $group: {
        _id: "$vehicleId",
        latestData: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$latestData" },
    },
  ]);

  if (!vehicleData.length) {
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
  const vehicleData = await VehicleData.findOne({ vehicleId: vehicle_id }).sort(
    {
      timestamp: -1,
    }
  );

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

// export const getVehicleLastLocation = catchAsync(async (req, res, next) => {
//   const vehicle_id = req.params.id;
//   const vehicleData = await VehicleData.findOne({ vehicleId: vehicle_id }).sort(
//     { timestamp: -1 }
//   );

//   if (!vehicleData) {
//     return next(new AppError("No vehicle data found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       vehicleData,
//     },
//   });
// });
