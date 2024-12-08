import User from '../models/User'; // Import the User model
import { validationResult } from 'express-validator'; // For request validation
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// Create a new user
export const createUser = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { name, email, phone, role, vehicleId } = req.body;

  // Check if the vehicleId is required for drivers
  if (role === 'driver' && !vehicleId) {
    return next(new AppError('Vehicle ID is required for drivers', 400));
  }

  const newUser = new User({
    name,
    email,
    phone,
    role,
    vehicleId: role === 'driver' ? vehicleId : null, // Only assign vehicleId for drivers
  });

  await newUser.save();

  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
  });
});

// Get all users (Managers can access all users)
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(); // Retrieve all users
  if (!users) {
    return next(new AppError('No users found', 404));
  }
  res.status(200).json(users);
});

// Get a single user by ID
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json(user);
});

// Update a user's details
export const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, role, vehicleId } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update user fields
  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.role = role || user.role;
  if (role === 'driver') {
    user.vehicleId = vehicleId || user.vehicleId;
  }

  await user.save();

  res.status(200).json({
    message: 'User updated successfully',
    user,
  });
});

// Delete a user (soft delete)
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isDeleted = true; // Soft delete by marking the user as deleted
  await user.save();

  res.status(200).json({ message: 'User deleted successfully' });
});
