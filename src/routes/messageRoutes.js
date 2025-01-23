import express from "express";
import { body } from "express-validator";
import multer from "multer";
import * as authController from "../controllers/authController.js";
import {
  createMessage,
  getMessages,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();
router.use(authController.protect);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Validation middleware
const validateMessage = [
  body("chatId").notEmpty().withMessage("Chat ID is required"),
  body("senderId").notEmpty().withMessage("Sender ID is required"),
  body("content.formattedText")
    .optional()
    .isString()
    .withMessage("Formatted text must be a string"),
  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

// Routes
router.post("/", upload.array("attachments"), validateMessage, createMessage);

router.get("/:chatId", getMessages);

router.delete("/:messageId", deleteMessage);

export default router;
