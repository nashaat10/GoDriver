import express from "express";
import { body } from "express-validator";
import multer from "multer";
import * as authController from "../controllers/authController.js";
import {
  createMessage,
  getMessageHistory,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();
router.use(authController.protect);

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image",
    "video",
    "audio",
    "application",
    "application/pdf",
  ];
  const fileType = file.mimetype.split("/")[0];

  if (allowedTypes.includes(fileType)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only images, videos, audio, and documents (PDF) are allowed",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post(
  "/",
  upload.array("attachments", 10),
  [
    body("chatId").isMongoId().withMessage("Invalid chat ID"),
    body("content").custom((value, { req }) => {
      if (!value && (!req.files || req.files.length === 0)) {
        throw new Error("Message must contain either text or attachments");
      }
      return true;
    }),
    body("replyTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid reply message ID"),
  ],
  createMessage
);

router.get("/:chatId", getMessageHistory);
router.delete("/:messageId", deleteMessage);

export default router;
