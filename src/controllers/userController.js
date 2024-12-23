import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import multer from "multer";
import sharp from "sharp";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import stream from "stream";
import Vehicle from "../models/vehicleModel.js";
import APIFeatures from "../utils/apiFeatures.js";

dotenv.config({ path: "../../config.env" });
cloudinary.v2.config({
  cloud_name: "db3rwgkan",
  api_key: "835868578195358",
  api_secret: "PZc_rlmffakBBa6tQtonM8blajc",
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single("profilePicture");

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Generate the filename
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Process the image buffer with Sharp
  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();

  // Use a PassThrough stream to upload the image buffer to Cloudinary
  const uploadStream = cloudinary.v2.uploader.upload_stream(
    { folder: "users", public_id: req.file.filename },
    (error, result) => {
      if (error) {
        return next(new AppError("Error uploading image to Cloudinary", 500));
      }

      // Set the Cloudinary URL on the request body
      req.body.profilePicture = result.secure_url;
      next();
    }
  );

  // Pipe the processed image buffer to Cloudinary's upload stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);
  bufferStream.pipe(uploadStream);
});

export const getAllDrivers = catchAsync(async (req, res, next) => {
  const drivers = await User.find({ createdBy: req.user.id, role: "driver" });
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
  const driverData = { ...req.body, createdBy: req.user.id };
  const driver = await User.create(driverData);

  // Assign the driver to a vehicle if a vehicle ID is provided
  const vehicleId = req.body.vehicleId;
  if (vehicleId) {
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { driverId: driver._id },
      { new: true }
    );

    if (!vehicle) {
      return next(new AppError("No vehicle found with that ID", 404));
    }
  }

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
  res.status(200).json({
    status: "success",
    message: "Driver deleted successfully",
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
  const filteredBody = filterObj(req.body, "name", "phone", "profilePicture");

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

export const searchDriversByName = catchAsync(async (req, res, next) => {
  const { name } = req.params;
  const drivers = await User.find({
    name: new RegExp(name, "i"),
    role: "driver",
  });

  if (drivers.length === 0) {
    return next(new AppError("No drivers found with that name", 404));
  }

  res.status(200).json({
    status: "success",
    results: drivers.length,
    data: {
      drivers,
    },
  });
});
