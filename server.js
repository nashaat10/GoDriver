import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { setupAlertHandlers } from "./src/sockets/alertHandler.js";
import { setupSocketHandlers } from "./src/sockets/socket.js";
import { setupChatHandlers } from "./src/sockets/chatSocket.js";
import init from "./src/config/fcm.js";
import { initSocket } from "./src/config/socket.js";
import { fcmMessaging } from "./src/config/fcm.js";

(async () => {
  try {
    dotenv.config({ path: "./config.env" });

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO

    // Setup alert handlers
    initSocket(server);
    setupSocketHandlers();
    setupChatHandlers();
    setupAlertHandlers();

    const DB = process.env.DATABASE_URL;

    await init();
    const dbConnection = await mongoose.connect(DB);
    console.log("Connected to Mongo DB: ", dbConnection.connections[0].name);

    const port = process.env.PORT || 4000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
})();
