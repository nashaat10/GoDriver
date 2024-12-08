import * as driverController from "../controllers/driverController.js";
import express from "express";
const router = express.Router();

router
  .route("/")
  .get(driverController.getAllDrivers)
  .post(driverController.createDriver);

router
  .route("/:id")
  .get(driverController.getDriver)
  .patch(driverController.updateDriver)
  .delete(driverController.deleteDriver);
export default router;
