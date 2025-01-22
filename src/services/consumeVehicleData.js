import amqp from "amqplib";
import mongoose from "mongoose";
import { VehicleData } from "../models/vehicleData.js";
import Vehicle from "../models/vehicleModel.js";
import { processAlert } from "./alertProcessor.js";
import dotenv from "dotenv";
import { fcmMessaging } from "../config/fcm.js";
import NotificationToken from "../models/notificationModel.js";

dotenv.config();
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://rabbitmq"
      );
      console.log("Successfully connected to RabbitMQ");
      return connection;
    } catch (error) {
      retries++;
      console.log(
        `Failed to connect to RabbitMQ. Attempt ${retries} of ${maxRetries}`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
    }
  }
  throw new Error("Failed to connect to RabbitMQ after multiple attempts");
};

const consumeVehicleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://bawq2024:bawq2024@godriver.94a2j.mongodb.net/?retryWrites=true&w=majority&appName=GoDriver"
    );
    console.log("Connected to MongoDB");

    // Connect to RabbitMQ
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    const queue = "vehicle_data";
    const alertQueue = "alerts";

    // Assert queues
    await channel.assertQueue(queue);
    await channel.assertQueue(alertQueue);

    console.log(
      `Waiting for messages in ${queue} and ${alertQueue}. To exit press CTRL+C`
    );

    // Vehicle data consumer
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const vehicleData = JSON.parse(msg.content.toString());
        console.log("Received Vehicle Data:", vehicleData);

        try {
          // Get random vehicle and its driver
          const vehicles = await Vehicle.find({}, "_id driverId");
          const randomVehicle =
            vehicles[Math.floor(Math.random() * vehicles.length)];

          // Assign vehicle and driver to the data
          vehicleData.driverId = randomVehicle.driverId;
          vehicleData.vehicleId = randomVehicle._id;

          const newVehicleData = new VehicleData(vehicleData);
          await newVehicleData.save();
          console.log("Vehicle data saved to database:", newVehicleData);
        } catch (error) {
          console.error("Error saving vehicle data:", error);
        }

        channel.ack(msg);
      }
    });

    // Alert consumer
    channel.consume(alertQueue, async (msg) => {
      if (msg !== null) {
        const alertData = JSON.parse(msg.content.toString());
        console.log("Received Alert Data:", alertData);

        try {
          const savedAlert = await processAlert(alertData);
          console.log("Alert processed and saved:", savedAlert);

          // const clientTokens = await NotificationToken.find({
          //   userId: alertData.driverId,
          // });
          const clientTokens = await NotificationToken.find();
          console.log("client tokens count:", clientTokens.length);
          await Promise.all(
            clientTokens.map(async (clientToken) => {
              const message = {
                token: clientToken.token,
                notification: {
                  title: savedAlert.alertType,
                  body: savedAlert.message,
                },
              };
              try {
                if (!fcmMessaging) {
                  console.log("fcmMessaging  inti>>>>", fcmMessaging);
                }
                await fcmMessaging.send(message);
                console.log("Successfully sent message:", message);
              } catch (error) {
                console.error("Error sending message:", error);
                if (
                  error.errorInfo.code ===
                    "messaging/registration-token-not-registered" ||
                  error.errorInfo.code === "messaging/invalid-argument" ||
                  error.errorInfo.code === "messaging/mismatched-credential"
                ) {
                  // Remove the invalid token from the database
                  await NotificationToken.deleteOne({
                    token: clientToken.token,
                  }).then(() => {
                    console.log(`Removed invalid token: ${clientToken.token}`);
                  });
                }
              }
            })
          );
        } catch (error) {
          console.error("Error processing alert:", error);
        }

        channel.ack(msg);
      }
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await channel.close();
        await connection.close();
        await mongoose.connection.close();
        console.log("\nGracefully shutting down...");
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error in Consumer:", error);
    process.exit(1);
  }
};

// Start the consumer
consumeVehicleData().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
