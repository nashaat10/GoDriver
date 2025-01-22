import { Alert } from "../models/vehicleData.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Get all alerts
export const getAllAlerts = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const alerts = await Alert.find()
    .populate("driverId", "name")
    .populate("vehicleId", "brand model")
    .sort("-alertTime")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: alerts.length,
    data: {
      alerts,
    },
  });
});

export const getAlertsByVehicle = catchAsync(async (req, res, next) => {
  const alerts = await Alert.find({ vehicleId: req.params.id })
    .populate("driverId", "name")
    .populate("vehicleId", "brand model")
    .sort("-alertTime");

  if (!alerts.length) {
    return next(new AppError("No alerts found for this vehicle", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      alerts,
    },
  });
});

export const getAlertsByType = catchAsync(async (req, res, next) => {
  const alerts = await Alert.find({ alertType: req.params.alertType })
    .populate("driverId", "name")
    .populate("vehicleId", "brand model")
    .sort("-alertTime");

  if (!alerts.length) {
    return next(new AppError("No alerts found for this type", 404));
  }

  res.status(200).json({
    status: "success",
    results: alerts.length,
    data: {
      alerts,
    },
  });
});

export const getAlertStats = catchAsync(async (req, res, next) => {
  const stats = await Alert.aggregate([
    {
      $group: {
        _id: null,
        numAlerts: { $sum: 1 },
        overSpeed: {
          $sum: { $cond: [{ $eq: ["$alertType", "speedAlert"] }, 1, 0] },
        },
        maintenance: {
          $sum: { $cond: [{ $eq: ["$alertType", "maintenance"] }, 1, 0] },
        },
        lowFuel: {
          $sum: { $cond: [{ $eq: ["$alertType", "lowFuel"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
