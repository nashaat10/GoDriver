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

router.get("/", getAllAlerts);

router.get("/length", getAlertsLength);

router.get("/:id", getAlertsByVehicle);

router.get("/type/:alertType", getAlertsByType);

export default router;
