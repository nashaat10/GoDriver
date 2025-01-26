import cloudinary from "../config/cloudinary.js";
import Message from "../models/message.js";
import Chat from "../models/chatModel.js";
import { getIO } from "../config/socket.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
// import { uploadToS3, getSignedFileUrl } from "../utils/s3Upload.js";
export const createMessage = catchAsync(async (req, res, next) => {
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
      let resourceType = "auto"; // Default to "auto" for automatic detection
      if (file.mimetype === "application/pdf") {
        resourceType = "raw"; // Set resource type to "raw" for PDF files
      }

      const result = await cloudinary.v2.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          resource_type: resourceType,
        }
      );

      console.log("Upload result:", result); // Log the entire result object
      console.log("file.mimetype", file.mimetype);

      uploadedAttachments.push({
        url: result.secure_url, // Use the secure_url directly
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
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name email profilePicture"
  );

  // Notify participants about the new message
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
