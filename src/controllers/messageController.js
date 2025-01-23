import Message from "../models/messageModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { getIO } from "../config/socket.js";
import multer from "multer";
import sharp from "sharp";
// Create a new messageS

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
}).array("attachments");

export const createMessage = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new AppError("File upload error", 400));
    }

    const senderId = req.user.id;
    const { chatId, content } = req.body;
    const attachments = req.files
      ? req.files.map((file) => ({
          type: file.mimetype.split("/")[0],
          key: file.filename,
          url: file.path,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          metadata: {
            width: file.width,
            height: file.height,
            duration: file.duration,
          },
        }))
      : req.body.attachments || [];

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
      attachments,
    });

    const populatedMessage = await message.populate(
      "sender",
      "name email profilePicture"
    );

    const io = getIO();
    io.to(`chat_${chatId}`).emit("newMessage", populatedMessage);

    res.status(201).json({
      status: "success",
      data: {
        message: populatedMessage,
      },
    });
  });
});

// Get all messages for a chat with pagination
export const getMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { before, limit = 20 } = req.query;

  const query = { chat: chatId };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate("sender", "name email profilePicture")
    .populate("replyTo");

  res.json({
    status: "success",
    data: {
      messages: messages.reverse(),
    },
  });
});

// Delete a message
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
