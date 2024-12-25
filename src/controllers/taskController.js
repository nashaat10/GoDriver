import Task from "../models/taskModel.js"; // Import the Task model
import User from "../models/userModel.js"; // Import the User model (to check if the manager and driver exist)
import AppError from "../utils/appError.js"; // Error handling utility
import catchAsync from "../utils/catchAsync.js"; // Async error handling utility

// Create a new task and assign it to a driver
export const createTask = catchAsync(async (req, res, next) => {
  const { title, description, driverId, startDate, deadline } = req.body;
  const managerId = req.user.id; // Assuming `req.user` contains the manager's information (via authentication)

  // Check if the driver exists
  const driver = await User.findById(driverId);
  if (!driver || driver.role !== "driver") {
    return next(
      new AppError(
        "No driver found with that ID or the user is not a driver",
        404
      )
    );
  }

  // Create the task
  const task = await Task.create({
    title,
    description,
    status: "pending",
    managerId, // The manager who created the task
    driverId, // The driver assigned to the task
    startDate,
    deadline,
    createdAt: Date.now(),
  });
  driver.tasks.push(task._id);
  await driver.save();

  res.status(201).json({
    status: "success",
    data: {
      task,
    },
  });
});

// Get all tasks assigned to a specific manager
export const getAllTasksForManager = catchAsync(async (req, res, next) => {
  const managerId = req.user.id; // Assuming `req.user.id` is the logged-in manager's ID

  const tasks = await Task.find({ managerId });

  if (!tasks || tasks.length === 0) {
    return next(new AppError("No tasks found for this manager", 404));
  }

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

// Get all tasks assigned to a specific driver
export const getAllTasksForDriver = catchAsync(async (req, res, next) => {
  const driverId = req.params.id;

  const tasks = await Task.find({ driverId });

  if (!tasks || tasks.length === 0) {
    return next(new AppError("No tasks found for this driver", 404));
  }

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

// Get a specific task by ID
export const getTaskById = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate(
    "managerId driverId"
  ); // Populate manager and driver details

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

// Update a task (e.g., changing status or other details)
export const updateTask = catchAsync(async (req, res, next) => {
  const { title, description, status, driverId, startDate, deadline } =
    req.body;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  // Only managers can update the task (you can extend this based on your needs)
  if (task.managerId.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to update this task", 403)
    );
  }

  // Optionally check if the driver exists (optional, if you are updating the driver)
  if (driverId) {
    const driver = await User.findOne({ _id: driverId, role: "driver" });
    if (!driver) {
      return next(new AppError("Driver not found", 404));
    }
  }

  // Update the task fields
  task.title = title || task.title;
  task.description = description || task.description;
  task.status = status || task.status;
  task.driverId = driverId || task.driverId;
  task.startDate = startDate || task.startDate;
  task.deadline = deadline || task.deadline;

  await task.save();

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

// Delete a task (soft delete)
export const deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  // Only managers can delete tasks (optional)
  if (task.managerId.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to delete this task", 403)
    );
  }

  task.isDeleted = true; // Soft delete by marking it as deleted
  await task.save();

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});
