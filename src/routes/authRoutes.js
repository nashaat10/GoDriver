import * as authController from "../controllers/authController.js";
import express from "express";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.protect, authController.logout);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/verify-otp", authController.verifyOTP);
router.patch("/resetPassword", authController.resetPassword);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

export default router;
