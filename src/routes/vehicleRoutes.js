import express from "express";
import * as authController from "../controllers/authController.js";

import {
  getVehicle,
  searchVehicleByPlateNumber,
  createVehicle,
  getAllVehicles,
  getVehiclesLength,
} from "../controllers/vehicleController.js";

const router = express.Router();

router.use(authController.protect);

router.route("/").get(getAllVehicles).post(createVehicle);
router.route("/length").get(getVehiclesLength);
router.get("/:id", getVehicle);
router.get("/search/:plateNumber", searchVehicleByPlateNumber);

export default router;
