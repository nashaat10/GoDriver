import * as driverController from "../controllers/driverController.js";
import express from "express";
import * as authController from "../controllers/authController.js";
const router = express.Router();

router
  .route("/")
  .get(authController.restrictedTo("manager"), driverController.getAllDrivers)
  .post(authController.restrictedTo("manager"), driverController.createDriver);

router
  .route("/:id")
  .get(driverController.getDriver)
  .patch(driverController.updateDriver)
  .delete(driverController.deleteDriver);
export default router;
