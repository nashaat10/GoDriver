import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import AppError from "./src/utils/appError.js";
import globalErrorHandler from "./src/controllers/errorController.js";
import taskRoutes from "./src/routes/taskRoutes.js";
<<<<<<< Updated upstream
import redisClient from "./src/config/redis.js";
=======
>>>>>>> Stashed changes
import alertRoutes from "./src/routes/alertsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";
import managerRoutes from "./src/routes/managerRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import driverRoutes from "./src/routes/driverRoutes.js";
<<<<<<< Updated upstream
import http from "http";
import { Server } from "socket.io";
=======
import clientRoutes from "./src/routes/clientRoutes.js";
>>>>>>> Stashed changes

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Enable CORS
app.use(cors());
app.options("*", cors());

<<<<<<< Updated upstream
//socketio connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// add route limit
=======
// Rate limiting
>>>>>>> Stashed changes
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
<<<<<<< Updated upstream

app.set("trust proxy", true);
app.use(express.static("./public"));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.sendStatus(200);
});

=======
>>>>>>> Stashed changes
app.use("/api", limiter);

// Routes
app.use("/api/v1/tasks", taskRoutes);
<<<<<<< Updated upstream
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/manager", managerRoutes);
// Redis connection
app.use("/api/v1/alerts", alertRoutes);
redisClient.connect();
//routes

// Sockets
=======
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/managers", managerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/drivers", driverRoutes);
app.use("/api/v1/clients", clientRoutes);
>>>>>>> Stashed changes

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;