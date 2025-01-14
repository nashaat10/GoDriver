import { getIO } from "../config/socket.js";
import { Alert } from "../models/vehicleData.js";
import Vehicle from "../models/vehicleModel.js";

export const setupAlertHandlers = () => {
  const io = getIO();
  io.on("connection", (socket) => {
    console.log("Client connected to alert handler");

    socket.on("subscribeToAlerts", () => {
      socket.join("alerts-room");
      console.log(`Client ${socket.id} subscribed to alerts`);
    });

    socket.on("unsubscribeFromAlerts", () => {
      socket.leave("alerts-room");
      console.log(`Client ${socket.id} unsubscribed from alerts`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected from alert handler");
    });
  });
};

export const emitAlert = async (alertData) => {
  const io = getIO();
  try {
    const vehicles = await Vehicle.find({}, "_id driverId");
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    alertData.driverId = randomVehicle.driverId;
    alertData.vehicleId = randomVehicle._id;

    const newAlert = new Alert(alertData);
    const savedAlert = await newAlert.save();

    const populatedAlert = await Alert.findById(savedAlert._id)
      .populate("driverId", "name")
      .populate("vehicleId", "vehicleNumber");

    io.to("alerts-room").emit("newAlert", {
      alert: populatedAlert,
      timestamp: new Date(),
      status: "new",
    });
    const clientTokens = await NotificationToken.findOne({
      userId: alertData.driverId,
    });

    if (clientTokens) {
      const message = {
        token: clientTokens.token,
        notification: {
          title: newAlert.alertType,
          body: newAlert.message,
        },
      };
      await fcmMessaging
        .send(message)
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
    }

    return savedAlert;
  } catch (error) {
    console.error("Error emitting alert:", error);
    io.to("alerts-room").emit("alertError", {
      error: "Failed to process alert",
      timestamp: new Date(),
    });
    throw error;
  }
};
