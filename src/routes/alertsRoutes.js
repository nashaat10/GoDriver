import express from "express";
import {
  getAllAlerts,
  getAlertsByVehicle,
  getAlertStats,
} from "../controllers/alertController.js";

import { protect, restrictTo } from "../controllers/authController.js";
const router = express.Router();

router.use(protect);

router.use(restrictTo("admin", "manager"));

router.get("/", getAllAlerts);

router.get("/stats", getAlertStats);

router.get("/:id", getAlertsByVehicle);

export default router;
