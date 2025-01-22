import Vehicle from "../models/vehicleModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getAllVehicles = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  let sort = {};
  if (req.query.sort) {
    sort = {
      [req.query.sort]: req.query.direction === "desc" ? -1 : 1,
    };
  }

  const vehicles = await Vehicle.find()
    .populate({
      path: "driverId",
      select: "name email phone profilePicture",
    })
    .skip(skip)
    .limit(limit)
    .sort(sort);

  res.status(200).json({
    status: "success",
    results: vehicles.length,
    currentPage: page,
    data: {
      vehicles,
    },
  });
});
export const getVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return next(new AppError("No vehicle found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      vehicle,
    },
  });
});

export const createVehicle = catchAsync(async (req, res, next) => {
  const { brand, model, year, plateNumber } = req.body;

  const vehicle = new Vehicle({
    brand,
    model,
    year,
    plateNumber,
  });

  const savedVehicle = await vehicle.save();
  res.status(201).json({
    status: "success",
    data: {
      vehicle: savedVehicle,
    },
  });
});

export const searchVehicleByPlateNumber = catchAsync(async (req, res, next) => {
  const { plateNumber } = req.params;
  const vehicle = await Vehicle.findOne({ plateNumber });

  if (!vehicle) {
    return next(new AppError("No vehicle found with that plate number", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      vehicle,
    },
  });
});

export const getVehiclesLength = catchAsync(async (req, res, next) => {
  const vehicles = await Vehicle.countDocuments();
  res.status(200).json({
    status: "success",
    data: {
      vehicles,
    },
  });
});
