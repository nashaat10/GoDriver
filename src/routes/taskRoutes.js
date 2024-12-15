import express from "express";
import {
  createTask,
  getAllTasksForManager,
  getAllTasksForDriver,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(restrictTo("manager", "admin"), createTask)
  .get(restrictTo("manager"), getAllTasksForManager);

router
  .route("/driver/:id")
  .get(restrictTo("driver", "manager", "admin"), getAllTasksForDriver);

router
  .route("/:id")
  .get(restrictTo("manager", "driver", "admin"), getTaskById)
  .patch(restrictTo("manager", "admin"), updateTask)
  .delete(restrictTo("manager", "admin"), deleteTask);

export default router;
