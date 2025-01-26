import Message from "../models/messageModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { getIO } from "../config/socket.js";
import multer from "multer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

cloudinary.v2.config({
  cloud_name: "db3rwgkan",
  api_key: "835868578195358",
  api_secret: "PZc_rlmffakBBa6tQtonM8blajc",
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("attachments");

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: "attachments" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Create a new message
export const createMessage = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new AppError("File upload error", 400));
    }

    const senderId = req.user.id;
    const { chatId, content } = req.body;

    let attachments = [];
    if (req.files) {
      attachments = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file);
          return {
            type: file.mimetype.split("/")[0],
            key: result.public_id,
            url: result.secure_url,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            metadata: {
              width: result.width,
              height: result.height,
              duration: result.duration,
            },
          };
        })
      );
    } else {
      attachments = req.body.attachments || [];
    }

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
