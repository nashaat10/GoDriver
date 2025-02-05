import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { getIO } from "../config/socket.js";
import User from "../models/userModel.js";
import { validationResult } from "express-validator";
import Message from "../models/message.js";

export const createChat = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { participants, type, name } = req.body;

  // Check if user has permission to create chats
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    req.user.role !== "driver"
  ) {
    //   return next(new AppError('You do not have permission to create chats', 403));
  }

  // For drivers, only allow private chats with managers/admins
  if (req.user.role === "driver") {
    const otherParticipant = await User.findById(participants[0]);
    if (
      !otherParticipant ||
      (otherParticipant.role !== "manager" && otherParticipant.role !== "admin")
    ) {
    }
    type = "private"; // Force private chat for drivers
  }

  // For managers, allow group chats only with their drivers
  if (req.user.role === "manager" && type === "group") {
    const allParticipants = await User.find({ _id: { $in: participants } });
    const invalidParticipants = allParticipants.some(
      (p) => p.role !== "driver" || p.managerId?.toString() !== req.user.id
    );
    if (invalidParticipants) {
    }
  }

  const chat = await Chat.create({
    participants: [...participants, req.user.id],
    type,
    name,
    createdBy: req.user.id,
  });

  const populatedChat = await Chat.findById(chat._id).populate(
    "participants",
    "name email profilePicture role"
  );

  // Notify participants
  const io = getIO();
  participants.forEach((participantId) => {
    io.to(`user_${participantId}`).emit("newChat", populatedChat);
  });

  res.status(201).json({
    status: "success",
    data: { chat: populatedChat },
  });
});

export const sendMessage = catchAsync(async (req, res, next) => {
  const { chatId, content } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  if (!chat.participants.includes(req.user.id)) {
    return next(new AppError("You are not a participant in this chat", 403));
  }

  const message = {
    sender: req.user.id,
    content,
    timestamp: new Date(),
  };

  chat.messages.push(message);
  chat.lastMessage = new Date();
  await chat.save();

  const populatedChat = await Chat.findById(chatId)
    .populate("participants", "name email profilePicture")
    .populate("messages.sender", "name email profilePicture");

  // Notify all participants about the new message
  const io = getIO();
  chat.participants.forEach((participantId) => {
    io.to(`user_${participantId}`).emit("newMessage", {
      chatId,
      message: populatedChat.messages[populatedChat.messages.length - 1],
    });
  });

  res.status(200).json({
    status: "success",
    data: {
      chat: populatedChat,
    },
  });
});

export const getChatHistory = catchAsync(async (req, res, next) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  if (!chat.participants.includes(req.user.id)) {
    return next(new AppError("You are not a participant in this chat", 403));
  }

  chat.messages.forEach((message) => {
    if (message.sender.toString() !== req.user.id) {
      message.readBy.push(req.user.id);
    }
  });
  await chat.save();

  res.status(200).json({
    status: "success",
    data: {
      chat,
    },
  });
});

export const getUserChats = catchAsync(async (req, res, next) => {
  let query = { participants: req.user.id };

  // For managers, only show chats with their drivers
  if (req.user.role === "manager") {
    const driverIds = await User.find({
      managerId: req.user.id,
      role: "driver",
    }).distinct("_id");

    query = {
      $and: [
        { participants: req.user.id },
        { participants: { $in: driverIds } },
      ],
    };
  }

  // For drivers, only show chats with their manager or admins
  if (req.user.role === "driver") {
    const managerId = req.user.managerId;
    const adminIds = await User.find({ role: "admin" }).distinct("_id");

    query = {
      $and: [
        { participants: req.user.id },
        { participants: { $in: [...adminIds, managerId] } },
      ],
    };
  }

  const chats = await Chat.find(query)
    .populate("participants", "name email profilePicture role")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name email profilePicture role" },
    })
    .sort("-updatedAt");

  res.status(200).json({
    status: "success",
    data: { chats },
  });
});

export const getChat = catchAsync(async (req, res, next) => {
  const chat = await Chat.findById(req.params.chatId).populate(
    "participants",
    "name email profilePicture role"
  );

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  if (
    !chat.participants.some(
      (participant) => participant._id.toString() === req.user.id
    )
  ) {
    return next(new AppError("You are not a participant in this chat", 403));
  }

  // Update unread messages where the recipient is the current user
  await Message.updateMany(
    {
      chat: req.params.chatId,
      recipient: req.user.id,
      deliveryStatus: { $ne: "read" },
    },
    { $set: { deliveryStatus: "read" } }
  );

  // return chat data with all messages
  const messages = await Message.find({ chat: req.params.chatId }).populate(
    "sender",
    "name email profilePicture role"
  );

  res.status(200).json({
    status: "success",
    data: {
      chat,
      messages,
    },
  });
});
