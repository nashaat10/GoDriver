import express from 'express';
import * as chatController from '../controllers/chatController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use(authController.protect);

router.route('/')
  .get(chatController.getChats)
  .post(chatController.createChat);

router.route('/message')
  .post(chatController.sendMessage);

export default router;