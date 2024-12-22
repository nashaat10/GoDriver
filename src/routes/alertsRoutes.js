import express from "express";
import { getAllAlerts, getAlertsByType , getAlertsByVehicle} from "../controllers/alertController.js";
const router = express.Router();

// Get all alerts
router.get("/", getAllAlerts);
// Get alerts by vehicle
router.get("/:id", getAlertsByVehicle);

// Get alerts by type
router.get('/type/:alertType', getAlertsByType);


export default router;