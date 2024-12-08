import * as authController from "../controllers/authController.js";
import * as driverController from "../controllers/driverController.js";
import express from "express";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("manager"),
    driverController.getAllDrivers
  )
  .post(
    authController.protect,
    authController.restrictTo("manager"),
    driverController.createDriver
  );

router
  .route("/:id")
  .get(driverController.getDriver)
  .patch(driverController.updateDriver)
  .delete(driverController.deleteDriver);
export default router;
