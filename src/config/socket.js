import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
      cors: {
        origin: "*", // In production, specify your frontend domain
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling']
      },
      allowEIO3: true
    });
    return io;
  };
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
