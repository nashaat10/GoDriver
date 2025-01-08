import { getIO } from '../config/socket.js';
import {Chat} from '../models/chatModel.js';

export const setupChatHandlers = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    console.log('Client connected to chat');

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { chatId, message } = data;
      const chat = await Chat.findById(chatId);
      chat.messages.push(message);
      await chat.save();

      io.to(chatId).emit('messageReceived', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from chat');
    });
  });
};