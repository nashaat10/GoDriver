import express from "express";
import * as chatController from "../controllers/chatController.js"
import {protect} from "../controllers/authController.js"

const router = express.Router();

// router.use(protect);
router.post("/", chatController.createChat);
router.post("/send",chatController.sendMessages);
router.get("/:chatId", chatController.getChatHistory);
router.post("/:chatId/join", chatController.joinChat);

export default router;

