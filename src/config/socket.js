import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

let io;



export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log(
        "Socket authentication attempt with token:",
        token ? "Present" : "Missing"
      );

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      const user = await User.findById(decoded.id);
      console.log("Found user:", user ? user.email : "No user found");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      console.log(`Socket authenticated for user: ${user.email}`);
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  io.on("error", (err) => {
    console.error("Socket error:", err.message);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const logRoomMembers = (roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  const members = room ? Array.from(room) : [];
  console.log(`Room ${roomId} members:`, members);
  return members;
};
