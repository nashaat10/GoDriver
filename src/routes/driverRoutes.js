import * as authController from "../controllers/authController.js";
import * as driverController from "../controllers/driverController.js";
import express from "express";
const router = express.Router();

router.use(authController.protect);

router
  .route("/drivers")
  .get(authController.restrictTo("manager"), driverController.getAllDrivers)
  .post(authController.restrictTo("manager"), driverController.createDriver);

router.route("/me").get(driverController.getMe, driverController.getUser);
router.route("/updateMe").patch(driverController.updateMe);
router.route("/deleteMe").patch(driverController.deleteMe);

router.use(authController.restrictTo("manager"));
router
  .route("/drivers/:id")
  .get(driverController.getUser)
  .patch(driverController.updateDriver)
  .delete(driverController.deleteDriver);
export default router;
