import Task from "../models/taskModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createTask = catchAsync(async (req, res, next) => {
  const { title, description, driverId, startDate, deadline } = req.body;
  const managerId = req.user.id;

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
    managerId,
    driverId,
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

export const getAllTasksForManager = catchAsync(async (req, res, next) => {
  const managerId = req.user.id;

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  const tasks = await Task.find({ managerId }).skip(skip).limit(limit);

  if (!tasks || tasks.length === 0) {
    return next(new AppError("No tasks found for this manager", 404));
  }

  res.status(200).json({
    status: "success",
    results: tasks.length,
    currentPage: page,
    data: {
      tasks,
    },
  });
});

export const getAllTasksForDriver = catchAsync(async (req, res, next) => {
  const driverId = req.params.id;

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  const tasks = await Task.find({ driverId }).skip(skip).limit(limit);

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

export const deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  if (task.managerId.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to delete this task", 403)
    );
  }

  task.isDeleted = true;
  await task.save();

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});

export const getTasksLength = catchAsync(async (req, res, next) => {
  const tasks = await Task.countDocuments();
  res.status(200).json({
    status: "success",
    data: {
      tasks,
    },
  });
});
