import Vehicle from '../models/vehicleModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';



export const getAllVehicles = catchAsync(async (req, res, next) => {
  const vehicles = await Vehicle.find();
  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: {
      vehicles,
    },
  });
});
// Get vehicle by ID
export const getVehicleData = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('driverId', 'name');
  if (!vehicle) {
    return next(new AppError('No vehicle found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      vehicle,
    },
  });
});

// Create a new vehicle
export const createVehicle = catchAsync(async (req, res, next) => {
  const { make, model, year, driverId, plateNumber } = req.body;
  const vehicle = new Vehicle({
    make,
    model,
    year,
    driverId,
    plateNumber,
  });

  const savedVehicle = await vehicle.save();
  res.status(201).json({
    status: 'success',
    data: {
      vehicle: savedVehicle,
    },
  });
});

// Search for a vehicle by plate number
export const searchVehicleByPlateNumber = catchAsync(async (req, res, next) => {
  const { plateNumber } = req.params;
  const vehicle = await Vehicle.findOne({ plateNumber });

  if (!vehicle) {
    return next(new AppError('No vehicle found with that plate number', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      vehicle,
    },
  });
});