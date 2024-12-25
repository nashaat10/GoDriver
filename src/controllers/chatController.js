import Chat from '../models/chatModel.js';
// import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { getIO } from '../config/socket.js';

export const createChat = catchAsync(async (req, res, next) => {
  const { participantId } = req.body;
  const currentUserId = req.user.id;

  // Check if chat already exists
  const existingChat = await Chat.findOne({
    participants: { $all: [currentUserId, participantId] }
  });

  if (existingChat) {
    return res.status(200).json({
      status: 'success',
      data: existingChat
    });
  }

  const chat = await Chat.create({
    participants: [currentUserId, participantId],
    messages: []
  });

  res.status(201).json({
    status: 'success',
    data: chat
  });
});

export const getChats = catchAsync(async (req, res, next) => {
  const chats = await Chat.find({
    participants: req.user.id
  })
  .populate('participants', 'name profilePicture')
  .populate('messages.sender', 'name profilePicture');

  res.status(200).json({
    status: 'success',
    data: chats
  });
});

export const sendMessage = catchAsync(async (req, res, next) => {
  const { chatId, content } = req.body;
  const senderId = req.user.id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  const message = {
    sender: senderId,
    content,
    timestamp: new Date()
  };

  chat.messages.push(message);
  chat.lastMessage = new Date();
  await chat.save();

  // Emit message to all participants
  const io = getIO();
  chat.participants.forEach(participantId => {
    if (participantId.toString() !== senderId.toString()) {
      io.to(`user_${participantId}`).emit('newMessage', {
        chatId,
        message
      });
    }
  });

  res.status(200).json({
    status: 'success',
    data: message
  });
});