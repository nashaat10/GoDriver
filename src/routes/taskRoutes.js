import express from "express";
import {
  createTask,
  getAllTasks,
  getAllTasksForDriver,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksStatus,
  getTasksStatusForDriver,
} from "../controllers/taskController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(restrictTo("manager", "admin"), createTask)
  .get(restrictTo("manager", "admin"), getAllTasks);

router.route("/status").get(getTasksStatus);
router.route("/status/driver").get(getTasksStatusForDriver);

router
  .route("/driver/:id")
  .get(restrictTo("driver", "manager", "admin"), getAllTasksForDriver);

router
  .route("/:id")
  .get(restrictTo("manager", "driver", "admin"), getTaskById)
  .patch(restrictTo("manager", "admin", "driver"), updateTask)
  .delete(restrictTo("manager", "admin"), deleteTask);

export default router;
