import cloudinary from "../config/cloudinary.js";
import Message from "../models/message.js";
import Chat from "../models/chatModel.js";
import { getIO } from "../config/socket.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { body, validationResult } from "express-validator";
import multer from "multer";

// Multer configuration for file uploads
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

// Validation middleware for creating a message
export const validateCreateMessage = [
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
];

export const createMessage = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { chatId, content, replyTo } = req.body;
  const attachments = req.files;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  if (!chat.participants.includes(req.user.id)) {
    return next(new AppError("Not a chat participant", 403));
  }

  const uploadedAttachments = [];
  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      let resourceType = "auto";
      if (file.mimetype === "application/pdf") {
        resourceType = "raw";
      }

      const result = await cloudinary.v2.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          resource_type: resourceType,
        }
      );

      uploadedAttachments.push({
        url: result.secure_url,
        public_id: result.public_id,
        fileType: file.mimetype,
      });
    }
  }

  const message = await Message.create({
    chat: chatId,
    sender: req.user.id,
    content,
    attachments: uploadedAttachments,
    replyTo,
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name email profilePicture"
  );

  const io = getIO();
  io.to(chatId).emit("newMessage", {
    chatId,
    message: populatedMessage,
  });

  chat.participants.forEach((participantId) => {
    io.to(`user_${participantId}`).emit("newMessage", {
      chatId,
      message: populatedMessage,
    });
  });

  res.status(201).json({
    status: "success",
    data: {
      message: populatedMessage,
    },
  });
});

export const getMessageHistory = catchAsync(async (req, res, next) => {
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
    .populate("sender", "name email profilePicture")
    .populate("replyTo");

  res.json({
    status: "success",
    data: {
      messages: messages.reverse(),
    },
  });
});

// Controller function to delete a message
export const deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    return next(new AppError("Message not found", 404));
  }

  if (message.sender.toString() !== req.user.id) {
    return next(new AppError("Not authorized to delete this message", 403));
  }

  message.isDeleted = true;
  await message.save();

  const io = getIO();
  io.to(`chat_${message.chat}`).emit("messageDeleted", {
    messageId: message._id,
  });

  res.json({
    status: "success",
    data: null,
  });
});

export const uploadMiddleware = upload.array("attachments", 10);
