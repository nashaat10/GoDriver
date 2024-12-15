import amqp from "amqplib";
import mongoose from "mongoose";
import { VehicleData, Alert } from "../models/vehicleData.js";
import Vehicle from "../models/vehicleModel.js"; // Import the Vehicle model
import dotenv from "dotenv";
import { io } from '../../app.js';
dotenv.config();

const consumeVehicleData = async () => {
  try {
    // Connect to MongoDB
    // const DB = process.env.DATABASE_URL;
    await mongoose.connect("mongodb+srv://bawq2024:bawq2024@godriver.94a2j.mongodb.net/?retryWrites=true&w=majority&appName=GoDriver");
    console.log("Connected to MongoDB");

    // Fetch all vehicles with their driver IDs
    const vehicles = await Vehicle.find({}, '_id driverId');
    console.log("Fetched Vehicles:", vehicles);

    // Connect to RabbitMQ
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "vehicle_data";
    const alertQueue = "alerts"; // Define alertQueue

    // Ensure the queue exists
    await channel.assertQueue(queue);
    await channel.assertQueue(alertQueue);

    console.log(`Waiting for messages in ${queue} and ${alertQueue}. To exit press CTRL+C`);

    // Consume messages from the queue
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const vehicleData = JSON.parse(msg.content.toString());
        console.log("Received Vehicle Data:", vehicleData);

        // Randomly select a vehicle and its associated driver
        const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        vehicleData.vehicleId = randomVehicle._id;
        vehicleData.driverId = randomVehicle.driverId;

        // Save the vehicle data to the database
        try {
          const newVehicleData = new VehicleData(vehicleData);
          await newVehicleData.save();
          console.log("Vehicle data saved to database:", newVehicleData);
        } catch (error) {
          console.error("Error saving vehicle data:", error);
        }

        // Acknowledge the message
        channel.ack(msg);
      }
    });

    // Consume alert messages from the alert queue
    channel.consume(alertQueue, async (msg) => {
      if (msg !== null) {
        const alertData = JSON.parse(msg.content.toString());
        console.log("Received Alert Data:", alertData);

        // Emit the alert through sockets
        io.emit('alert', alertData, (ack) => {
          if (ack) {
            console.log('Alert sent successfully:', alertData);
          } else {
            console.error('Failed to send alert:', alertData);
          }
        });

        // Save the alert to the database
        try {
          const vehicles = await Vehicle.find({}, '_id driverId');
          const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
          alertData.driverId = randomVehicle.driverId;
          alertData.vehicleId = randomVehicle._id;
          const newAlert = new Alert(alertData);
          await newAlert.save();
          console.log('Alert saved to database:', newAlert);
        } catch (error) {
          console.error('Error saving alert to database:', error);
        }

        // Acknowledge the message
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error in Consumer:", error);
  }
};

consumeVehicleData();