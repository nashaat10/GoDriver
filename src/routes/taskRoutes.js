import express from "express";
// Import task controller methods
import {
  createTask,
  getAllTasksForManager,
  getAllTasksForDriver,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect, restrictTo } from "../controllers/authController.js";

// import { protect, restrictTo } from '../middlewares/authMiddleware'; // Middleware to protect routes and restrict access to certain roles

const router = express.Router();

// Protect all routes in this router
// router.use(protect);

router.use(protect);
// Routes for **Managers**
router
  .route("/")
  .post(restrictTo("manager"), createTask) // Only managers can create tasks
  .get(restrictTo("manager"), getAllTasksForManager); // Only managers can view tasks they created

// Routes for **Drivers**
router
  .route("/driver/:id")
  .get(restrictTo("driver", "manager"), getAllTasksForDriver); // Both drivers and managers can view tasks assigned to the driver

// Routes for specific task by ID
router
  .route("/:id")
  .get(restrictTo("manager", "driver"), getTaskById) // Both managers and drivers can view a specific task
  .patch(restrictTo("manager"), updateTask) // Only managers can update tasks
  .delete(restrictTo("manager"), deleteTask); // Only managers can delete tasks

export default router;
