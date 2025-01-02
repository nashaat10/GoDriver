import express from "express";
import * as authController from "../controllers/authController.js";
import * as trackingController from "../controllers/trackingController.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(
    authController.restrictTo("admin", "manager"),
    trackingController.getLastVehicleData
  );

router.route("/:id").get(trackingController.getVehicleData);

// router.route("/live/:id").get(trackingController.getVehicleLastLocation);
export default router;
