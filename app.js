import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import AppError from "./src/utils/appError.js";
import globalErrorHandler from "./src/controllers/errorController.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import redisClient from "./src/config/redis.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();
// add route limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use(express.static("./public"));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", limiter);

app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/manager", userRoutes);
app.use("/api/v1/driver", userRoutes);
// Redis connection
redisClient.connect();

// Sockets

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

export default app;
