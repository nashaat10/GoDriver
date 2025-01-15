import express from "express";
import { createOne } from "../controllers/notificationController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);
router.post("/send-notification", createOne);

export default router;
