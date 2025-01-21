import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
// import { authenticate } from '../middleware/auth.js';
import * as authController from "../controllers/authController.js";
import Message from '../models/message.js';
import Chat from '../models/chatModel.js';
import { getIO } from '../config/socket.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
// import { uploadToS3, getSignedFileUrl } from '../utils/s3Upload.js';

const router = express.Router();

// Add after multer configuration (around line 13)

const storage = multer.diskStorage ({

    destination: (req,file,cb)=>{
        cb(null, 'uploads/');
    },
    filename: (req,file,cb)=>{
        cb(null , Date.now() + '-' + file.originalname)
    }
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image', 'video', 'audio', 'application'];
    const fileType = file.mimetype.split('/')[0];
    
    if (allowedTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only images, videos, audio, and documents are allowed', 400), false);
    }
  };
  
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });


  router.post('/', 
    authController.restrictTo('admin', 'manager', 'driver'),
    upload.array('attachments', 10),
    [
      body('chatId').isMongoId().withMessage('Invalid chat ID'),
      body('content').custom((value, { req }) => {
        if (!value.text && (!req.files || req.files.length === 0)) {
          throw new Error('Message must contain either text or attachments');
        }
        return true;
      }),
      body('replyTo').optional().isMongoId().withMessage('Invalid reply message ID')
    ],
  catchAsync(async (req, res, next) => {
    const { chatId, content, replyTo } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new AppError('Chat not found', 404));
    }

    if (!chat.participants.includes(req.user.id)) {
      return next(new AppError('Not a chat participant', 403));
    }

    const attachments = req.files.map(file =>({
        type: file.mimetype.split('/')[0],
        key: file.filename,
        url: `/uploads/${file.filename}`,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));


    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      content,
      attachments,
      replyTo
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id
    });

    const populatedMessage = await message.populate(['sender', 'replyTo']);


    const io = getIO();
    chat.participants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('newMessage', {
        chatId,
        message: populatedMessage
      });
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: populatedMessage
      }
    });
  })
);

// Get message history
router.get('/:chatId', 
  catchAsync(async (req, res, next) => {
    const { chatId } = req.params;
    const { before } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    const query = { chat: chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email profilePicture')
      .populate('replyTo');

    res.json({
      status: 'success',
      data: {
        messages: messages.reverse()
      }
    });
  })
);

// Delete message
router.delete('/:messageId',
  catchAsync(async (req, res, next) => {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    if (message.sender.toString() !== req.user.id) {
      return next(new AppError('Not authorized to delete this message', 403));
    }

    message.isDeleted = true;
    await message.save();

    const io = getIO();
    io.to(`chat_${message.chat}`).emit('messageDeleted', {
      messageId: message._id
    });

    res.json({
      status: 'success',
      data: null
    });
  })
);

export default router;