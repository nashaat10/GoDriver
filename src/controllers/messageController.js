
import cloudinary from "../config/cloudinary.js"
import Message from "../models/message.js";
import Chat from "../models/chatModel.js";
import { getIO } from "../config/socket.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
// import { uploadToS3, getSignedFileUrl } from "../utils/s3Upload.js";

export const createMessage = catchAsync(async (req, res, next) => {
  const { chatId, content, replyTo } = req.body;
  const attachments =req.files;



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
      const result = await cloudinary.v2.uploader.upload(file.path, {
        resource_type: 'auto', // Automatically detect the file type
      });
      uploadedAttachments.push({
        url: result.secure_url,
        public_id: result.public_id,
        fileType: file.mimetype.split('/')[0], // e.g., image, video, etc.
      });
    }
  }

  const message = await Message.create({
    chat: chatId,
    sender: req.user.id,
    content,
    attachments,
    replyTo,
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  const populatedMessage = await message.populate(["sender", "replyTo"]);

  // Generate signed URLs for all attachments
  if (populatedMessage.attachments?.length) {
    populatedMessage.attachments = await Promise.all(
      populatedMessage.attachments.map(async (attachment) => ({
        ...attachment.toObject(),
        url: await getSignedFileUrl(attachment.key),
      }))
    );
  }
  const io = getIO();
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