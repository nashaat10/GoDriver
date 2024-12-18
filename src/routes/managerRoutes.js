import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import express from "express";
import User from "../models/userModel.js"; // Import the User model
import catchAsync from "../utils/catchAsync.js"; // Import catchAsync utility

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo("manager"));

router.route("/me").get(userController.getMe, userController.getUser);
router
  .route("/updateMe")
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.route("/deleteMe").patch(userController.deleteMe);

export default router;
