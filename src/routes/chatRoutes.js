import express from "express";
import { body } from "express-validator";
import { protect, restrictTo } from "../controllers/authController.js";
import * as chatController from "../controllers/chatController.js";
import catchAsync from "../utils/catchAsync.js";
import Message from "../models/message.js";

const router = express.Router();

router.use(protect);

// Create chat
router.post(
  "/",
  [
    body("participants").isArray().notEmpty(),
    body("type").isIn(["private", "group"]),
    body("name").if(body("type").equals("group")).notEmpty(),
  ],
  chatController.createChat
);

// Get user's chats
router.get("/", chatController.getUserChats);

// Get chat history
router.get("/:chatId", chatController.getChatHistory);
router.get("/read/:chatId", chatController.markChatAsRead);

export default router;
