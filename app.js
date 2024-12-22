import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import AppError from "./src/utils/appError.js";
import globalErrorHandler from "./src/controllers/errorController.js";
import taskRoutes from "./src/routes/taskRoutes.js";
// import redisClient from "./src/config/redis.js";
import alertRoutes from "./src/routes/alertsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";
import managerRoutes from "./src/routes/managerRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import driverRoutes from "./src/routes/driverRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import http from "http";
import { Server } from "socket.io";

const app = express();

//create http server
const server = http.createServer(app);

//create socket server
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//socket io connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// add route limit
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.set("trust proxy", true);
app.use(express.static("./public"));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.sendStatus(200);
});

app.use("/api", limiter);

app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/manager", managerRoutes);
app.use("/api/v1/client", clientRoutes);
app.use("/api/v1/alerts", alertRoutes);
// redisClient.connect();
//routes

// Sockets

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

export default server;
