import express from "express";
import { Alert } from "../models/vehicleData.js";
import catchAsync from "../utils/catchAsync.js";
import Vehicle from '../models/vehicleModel.js';

const router = express.Router();

// Get all alerts
router.get("/", catchAsync(async (req, res) => {
    const alerts = await Alert
        .find()
        .populate('driverId', 'name')
        .populate('vehicleId', 'brand model')
        .sort('-alertTime');

    res.status(200).json({
        status: 'success',
        results: alerts.length,
        data: {
            alerts
        }
    });
}));

// Get alerts by vehicle
router.get("/:id", catchAsync(async (req, res) => {
    const alerts = await Alert.find({ vehicleId: req.params.id })
        .populate('driverId', 'name')
        .populate('vehicleId', 'brand model')
        .sort('-alertTime');

    if (!alerts.length) {
        return res.status(404).json({ message: 'No alerts found for this vehicle' });
    }

    res.status(200).json({
        status: 'success',
        data: {
            alerts
        }
    });
}));

// Get alerts by type
router.get('/type/:alertType', catchAsync(async (req, res) => {
    const alerts = await Alert.find({ alertType: req.params.alertType })
        .populate('driverId', 'name')
        .populate('vehicleId', 'brand model')
        .sort('-alertTime');

    res.status(200).json({
        status: 'success',
        results: alerts.length,
        data: {
            alerts
        }
    });
}));

router.post("/trigger-alert", (req, res) => {
    const alertData = req.body; // Assume alert data is sent in the request body

    // Emit the alert through sockets
    io.emit("alert", alertData, (ack) => {
      if (ack) {
        console.log("Alert sent successfully:", alertData);
        res.status(200).json({ status: "success", message: "Alert sent successfully" });
      } else {
        console.error("Failed to send alert:", alertData);
        res.status(500).json({ status: "error", message: "Failed to send alert" });
      }
    });
  });


export default router;