import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import express from "express";

const router = express.Router();

router.use(authController.protect);

router.use(authController.restrictTo("driver"));

router
  .route("/updateMe")
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.route("/deleteMe").patch(userController.deleteMe);

export default router;
