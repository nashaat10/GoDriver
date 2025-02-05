import { verifyToken } from "../middleware/auth.js";
import User from "../models/userModel.js";
import Message from "../models/message.js";
import Chat from "../models/chatModel.js";
import { getIO } from "../config/socket.js";
// import logger from '../utils/logger.js';

export const setupChatHandlers = () => {
  const io = getIO();

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.token;
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
        io.to(chatId);
      } catch (error) {
        logger.error("Message error:", error);
        socket.emit("message-error", { error: "Failed to send message" });
      }
    });

    socket.on("userActivity", async () => {
      await User.findByIdAndUpdate(
        userId,
        {
          status: "online",
          lastSeen: new Date(),
        },
        setInterval(() => {
          const onlineUsers = Array.from(connectedUsers.keys());
          io.emit("online-users", onlineUsers);
        }, 1000)
      );
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

    socket.on("delivered", async ({ userId }) => {
      try {
        const chats = await Chat.find({ participants: userId }).distinct("_id");

        if (chats.length === 0) {
          console.log(`No chats found for user ${userId}`);
          return;
        }

        const updated = await Message.updateMany(
          {
            chat: { $in: chats },
            recipient: userId, // Messages sent to the user
            deliveryStatus: "sent",
          },
          { deliveryStatus: "delivered" }
        );

        io.to(userId).emit("delivered", {
          userId,
          modifiedCount: updated.modifiedCount,
        });

        console.log(
          `Marked ${updated.modifiedCount} messages as delivered for user ${userId}`
        );
      } catch (error) {
        console.error("Mark all delivered error:", error);

        // Emit an error event to the client
        socket.emit("delivered_error", {
          message: "Failed to mark messages as delivered",
          error: error.message,
        });
      }
    });

    socket.on("in-chat", async ({ chatId, userId }) => {
      try {
        socket.join(chatId);

        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.error(`Chat not found: ${chatId}`);
          return;
        }

        // Get messages and send history
        const messages = await Message.find({ chat: chatId }).populate(
          "sender"
        );
        socket.emit("message-history", { chatId, messages });

        // Mark messages as read
        const updateResult = await Message.updateMany(
          {
            chat: chatId,
            recipient: userId,
            deliveryStatus: "delivered",
          },
          { deliveryStatus: "read" }
        );

        if (updateResult.modifiedCount > 0) {
          // Get updated messages
          const updatedMessages = await Message.find({
            chat: chatId,
            recipient: userId,
            deliveryStatus: "read",
          });

          // Emit to all chat participants
          io.to(chatId).emit("messages-read", {
            chatId,
            readerId: userId,
            messageIds: updatedMessages.map((m) => m._id),
          });

          console.log(`Marked ${updateResult.modifiedCount} messages as read`);
        }
      } catch (error) {
        console.error("Chat join error:", error);
        socket.emit("chat-error", {
          message: "Failed to join chat",
          chatId,
        });
      }
    });
  });

  // Broadcast online status updates
  setInterval(() => {
    const onlineUsers = Array.from(connectedUsers.keys());
    io.emit("online-users", onlineUsers);
  }, 1000);
};
