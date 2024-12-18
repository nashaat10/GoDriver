import { Alert } from "../models/vehicleData.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Get all alerts
export const getAllAlerts = catchAsync(async (req, res, next) => {
  const alerts = await Alert.find()
    .populate('driverId', 'name')
    .populate('vehicleId', 'brand model')
    .sort('-alertTime');

  res.status(200).json({
    status: 'success',
    results: alerts.length,
    data: {
      alerts,
    },
  });
});

// Get alerts by vehicle
export const getAlertsByVehicle = catchAsync(async (req, res, next) => {
  const alerts = await Alert.find({ vehicleId: req.params.id })
    .populate('driverId', 'name')
    .populate('vehicleId', 'brand model')
    .sort('-alertTime');

  if (!alerts.length) {
    return next(new AppError('No alerts found for this vehicle', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      alerts,
    },
  });
});

// Get alerts by type
export const getAlertsByType = catchAsync(async (req, res, next) => {
  const alerts = await Alert.find({ alertType: req.params.alertType })
    .populate('driverId', 'name')
    .populate('vehicleId', 'brand model')
    .sort('-alertTime');

  if (!alerts.length) {
    return next(new AppError('No alerts found for this type', 404));
  }

  res.status(200).json({
    status: 'success',
    results: alerts.length,
    data: {
      alerts,
    },
  });
});