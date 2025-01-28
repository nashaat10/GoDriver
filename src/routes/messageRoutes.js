import express from "express";
import * as authController from "../controllers/authController.js";
<<<<<<< HEAD
import {
  createMessage,
  getMessages,
  deleteMessage,
} from "../controllers/messageController.js";
=======
import * as messageController from "../controllers/messageController.js";
>>>>>>> deaa1bd09d1bfed6e15df34570010c3b42739b1f

const router = express.Router();
router.use(authController.protect);

<<<<<<< HEAD
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
=======
router.post(
  "/",
  messageController.uploadMiddleware,
  messageController.validateCreateMessage,
  messageController.createMessage
);

router.get("/:chatId", messageController.getMessageHistory);
router.delete("/:messageId", messageController.deleteMessage);
>>>>>>> deaa1bd09d1bfed6e15df34570010c3b42739b1f


<<<<<<< HEAD
=======


>>>>>>> deaa1bd09d1bfed6e15df34570010c3b42739b1f
export default router;
