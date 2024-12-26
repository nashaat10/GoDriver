import express from "express";
import {
  getAllAlerts,
  getAlertsByType,
  getAlertsByVehicle,
  getAlertsLength,
} from "../controllers/alertController.js";

import { protect, restrictTo } from "../controllers/authController.js";
const router = express.Router();

router.use(protect);

router.use(restrictTo("admin", "manager"));
// Get all alerts
router.get("/", getAllAlerts);

router.get("/length", getAlertsLength);
// Get alerts by vehicle
router.get("/:id", getAlertsByVehicle);

// Get alerts by type
router.get("/type/:alertType", getAlertsByType);

export default router;
