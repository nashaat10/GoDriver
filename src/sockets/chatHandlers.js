import { getIO } from '../config/socket.js';

export const setupChatHandlers = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    // Join user to their personal room
    socket.on('authenticate', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(`user_${data.recipientId}`).emit('userTyping', {
        chatId: data.chatId,
        userId: data.userId
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(`user_${data.recipientId}`).emit('userStoppedTyping', {
        chatId: data.chatId,
        userId: data.userId
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from chat');
    });
  });
};