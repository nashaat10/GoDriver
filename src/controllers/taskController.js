import Task from "../models/taskModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createTask = catchAsync(async (req, res, next) => {
  const { title, description, driverId, startDate, deadline } = req.body;
  const createdBy = req.user.id;

  const driver = await User.findById(driverId);
  if (!driver || driver.role !== "driver") {
    return next(
      new AppError(
        "No driver found with that ID or the user is not a driver",
        404
      )
    );
  }

  const task = await Task.create({
    title,
    description,
    status: "pending",
    createdBy,
    driverId,
    startDate,
    deadline,
    createdAt: Date.now(),
  });
  // driver.tasks.push(task._id);
  // await driver.save();

  res.status(201).json({
    status: "success",
    data: {
      task,
    },
  });
});

export const getAllTasks = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  const sort = {
    createdAt: -1,
  };

  if (req.query.sort) {
    sort[req.query.sort] = req.query.direction === "desc" ? -1 : 1;
  }

  const tasks = await Task.find()
    .populate({ path: "driverId", select: "name email phone" })
    .sort(sort)
    .skip(skip)
    .limit(limit);
  if (!tasks) {
    return next(new AppError("No tasks found", 404));
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
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const taskCount = await Task.countDocuments({ driverId });

  const tasks = await Task.find({ driverId }).skip(skip).limit(limit);

  if (!tasks || tasks.length === 0) {
    return next(new AppError("No tasks found for this driver", 404));
  }

  res.status(200).json({
    status: "success",
    totalTasks: taskCount,
    results: tasks.length,
    currentPage: page,
    data: {
      tasks,
    },
  });
});

export const getTaskById = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate("driverId");

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

  if (driverId) {
    const driver = await User.findOne({ _id: driverId, role: "driver" });
    if (!driver) {
      return next(new AppError("Driver not found", 404));
    }
  }

  task.runValidators = false;

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

export const getTasksStatus = catchAsync(async (req, res, next) => {
  const status = await Task.aggregate([
    {
      $group: {
        _id: "null",
        totalTasks: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        inProgress: {
          $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        delayed: { $sum: { $cond: [{ $eq: ["$status", "delayed"] }, 1, 0] } },
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
      status,
    },
  });
});
