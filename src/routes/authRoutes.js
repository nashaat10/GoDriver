import * as authController from "../controllers/authController.js";
import {
  getMe,
  getUser,
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe,
} from "../controllers/userController.js";
import express from "express";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.protect, authController.logout);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/verify-otp", authController.verifyOTP);
router.patch("/resetPassword", authController.resetPassword);
router.get("/me", authController.protect, getMe, getUser);
router.route("/updateMe").patch(uploadUserPhoto, resizeUserPhoto, updateMe);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

export default router;
