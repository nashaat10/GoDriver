import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import AppError from "./src/utils/appError.js";
import globalErrorHandler from "./src/controllers/errorController.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import alertRoutes from "./src/routes/alertsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";
import managerRoutes from "./src/routes/managerRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import driverRoutes from "./src/routes/driverRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import trackRoutes from "./src/routes/trackingRoutes.js";
import chatRoutes  from "./src/routes/chatRoutes.js";



const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
// app.options("*", cors());

// Rate limiting
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

// app.set("trust proxy", true);
app.use(express.static("./public"));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.sendStatus(200);
});

app.use("/api", limiter);
// Routes
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/manager", managerRoutes);
app.use("/api/v1/client", clientRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/tracking", trackRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
