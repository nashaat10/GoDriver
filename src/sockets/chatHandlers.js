import { getIO, logRoomMembers } from '../config/socket.js';
import Chat from '../models/chatModel.js';
import Message from '../models/message.js';
import logger from '../utils/logger.js';

export const setupChatHandlers = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    console.log('Client connected to chat with ID:', socket.id);
    console.log('Authenticated User:', socket.user?.email);

    if (socket.user) {
      socket.join(`user_${socket.user.id}`);
      console.log(`User ${socket.user.email} joined their personal room`);
    }

    socket.on('joinChat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        if (!chat.participants.includes(socket.user.id)) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }

        socket.join(`chat_${chatId}`);
        console.log(`User ${socket.user.email} joined chat: ${chatId}`);
        logRoomMembers(`chat_${chatId}`);

        socket.emit('chatJoined', { chatId });
      } catch (error) {
        logger.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    socket.on('typing', ({ chatId }) => {
      console.log(`User ${socket.user.email} typing in chat ${chatId}`);
      socket.to(`chat_${chatId}`).emit('userTyping', {
        chatId,
        userId: socket.user.id,
        userName: socket.user.name
      });
    });

    socket.on('stopTyping', ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit('userStoppedTyping', {
        chatId,
        userId: socket.user.id
      });
    });

    socket.on('markAsRead', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          const readBy = { user: socket.user.id, readAt: new Date() };
          if (!message.readBy.some(r => r.user.toString() === socket.user.id)) {
            message.readBy.push(readBy);
            message.deliveryStatus = 'read';
            await message.save();
            
            io.to(`chat_${message.chat}`).emit('messageRead', {
              messageId,
              userId: socket.user.id,
              readAt: readBy.readAt
            });
          }
        }
      } catch (error) {
        logger.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.user?.email}`);
    });
  });
};