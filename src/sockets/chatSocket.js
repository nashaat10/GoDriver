import { verifyToken } from "../middleware/auth.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";
import { getIO } from "../config/socket.js";
// import logger from '../utils/logger.js';

export const setupChatHandlers = () => {
  const io = getIO();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (!user) throw new Error("User not found");
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  const connectedUsers = new Map();
  const userTypingStatus = new Map();

  io.on("connection", async (socket) => {
    const userId = socket.user._id;
    connectedUsers.set(userId.toString(), socket.id);

    // Update user status and join rooms
    await User.findByIdAndUpdate(userId, {
      status: "online",
      lastSeen: new Date(),
    });

    const userChats = await Chat.find({ participants: userId });
    userChats.forEach((chat) => {
      socket.join(chat._id.toString());
    });
    socket.join(userId.toString());

    // Handle messages
    socket.on("message", async (data) => {
      try {
        const { chatId, content, attachments, replyTo } = data;
        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content,
          attachments,
          replyTo,
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
        });

        io.to(chatId).emit("new-message", {
          message: await message.populate(["sender", "replyTo"]),
        });

        // Send delivery status
        socket.to(chatId).emit("message-delivered", {
          messageId: message._id,
          chatId,
        });
      } catch (error) {
        logger.error("Message error:", error);
        socket.emit("message-error", { error: "Failed to send message" });
      }
    });

    // Handle typing indicators with debouncing
    socket.on("typing-start", async ({ chatId }) => {
      const key = `${userId}-${chatId}`;
      if (!userTypingStatus.has(key)) {
        userTypingStatus.set(key, true);
        socket.to(chatId).emit("user-typing", {
          userId,
          chatId,
          isTyping: true,
        });

        // Clear typing status after 3 seconds
        setTimeout(() => {
          userTypingStatus.delete(key);
          socket.to(chatId).emit("user-typing", {
            userId,
            chatId,
            isTyping: false,
          });
        }, 3000);
      }
    });

    // Handle read receipts
    socket.on("message-read", async ({ messageId, chatId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              user: userId,
              readAt: new Date(),
            },
          },
          deliveryStatus: "read",
        });

        socket.to(chatId).emit("receipt-updated", {
          messageId,
          userId,
          status: "read",
        });
      } catch (error) {
        logger.error("Read receipt error:", error);
      }
    });

    // Handle reactions
    socket.on("message-reaction", async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        const existingReaction = message.reactions.find(
          (r) => r.user.toString() === userId.toString()
        );

        if (existingReaction) {
          existingReaction.emoji = emoji;
        } else {
          message.reactions.push({ user: userId, emoji });
        }

        await message.save();
        io.to(message.chat.toString()).emit("reaction-updated", {
          messageId,
          reactions: message.reactions,
        });
      } catch (error) {
        logger.error("Reaction error:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      connectedUsers.delete(userId.toString());
      await User.findByIdAndUpdate(userId, {
        status: "offline",
        lastSeen: new Date(),
      });

      // Notify others about user's offline status
      userChats.forEach((chat) => {
        socket.to(chat._id.toString()).emit("user-offline", {
          userId,
          lastSeen: new Date(),
        });
      });
    });
  });

  // Broadcast online status updates
  setInterval(() => {
    const onlineUsers = Array.from(connectedUsers.keys());
    io.emit("online-users", onlineUsers);
  }, 30000);
};
