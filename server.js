import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { initSocket } from "./src/config/socket.js";
import { setupAlertHandlers } from "./src/sockets/alertHandler.js";
import { setupSocketHandlers } from "./src/sockets/socket.js";
import { setupChatHandlers } from "./src/sockets/chatHandlers.js";
import init from './src/services/fcm.js'

dotenv.config({ path: "./config.env" });

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Setup alert handlers
setupSocketHandlers();
setupChatHandlers();
setupAlertHandlers();

const DB = process.env.DATABASE_URL;

mongoose.connect(DB).then(() => {
  console.log("Database connection successful");
});
init().then(console.log())
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




export default server;
