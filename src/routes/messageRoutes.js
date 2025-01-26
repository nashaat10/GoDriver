import express from "express";
import * as authController from "../controllers/authController.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();
router.use(authController.protect);

router.post(
  "/",
  messageController.uploadMiddleware,
  messageController.validateCreateMessage,
  messageController.createMessage
);

router.get("/:chatId", messageController.getMessageHistory);
router.delete("/:messageId", messageController.deleteMessage);




export default router;
