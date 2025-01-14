import express from "express";
import { sendNotification } from "../controllers/notificationController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);
router.post("/send-notification", sendNotification);

export default router;
