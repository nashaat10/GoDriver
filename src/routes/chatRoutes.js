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

export default router;

// // Get user's chats
// router.get('/', authenticate, async (req, res) => {
//   try {
//     const chats = await Chat.find({ participants: req.user._id })
//       .populate('participants', 'name avatar status')
//       .populate('lastMessage');
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching chats' });
//   }
// });

// // Create new chat
// router.post('/',
//   authenticate,
//   [
//     body('participants').isArray().notEmpty(),
//     body('type').isIn(['private', 'group']),
//     body('name').if(body('type').equals('group')).notEmpty()
//   ],
//   async (req, res) => {
//     try {
//       const { type, name, participants } = req.body;

//       if (type === 'private' && participants.length !== 1) {
//         return res.status(400).json({
//           message: 'Private chat must have exactly one participant'
//         });
//       }

//       const chat = await Chat.create({
//         type,
//         name,
//         participants: [...participants, req.user._id],
//         admins: type === 'group' ? [req.user._id] : []
//       });

//       res.status(201).json(await chat.populate('participants'));
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating chat' });
//     }
//   }
// );

// // Get chat messages
// router.get('/:chatId/messages', authenticate, async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { before } = req.query;
//     const limit = parseInt(req.query.limit) || 50;

//     const query = { chat: chatId };
//     if (before) query.createdAt = { $lt: before };

//     const messages = await Message.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .populate('sender', 'name avatar')
//       .populate('replyTo');

//     res.json(messages.reverse());
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching messages' });
//   }
// });

// export default router;
