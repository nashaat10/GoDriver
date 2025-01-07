import mongoose from "mongoose";
import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq");
      console.log("Successfully connected to RabbitMQ");
      return connection;
    } catch (error) {
      retries++;
      console.log(`Failed to connect to RabbitMQ. Attempt ${retries} of ${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
    }
  }
  throw new Error("Failed to connect to RabbitMQ after multiple attempts");
};

const generateVehicleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://bawq2024:bawq2024@godriver.94a2j.mongodb.net/?retryWrites=true&w=majority&appName=GoDriver");
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();
    const queue = "vehicle_data";
    const alertQueue = "alerts";
    await channel.assertQueue(queue);
    await channel.assertQueue(alertQueue);

    // Fetch all vehicle IDs directly from the database
    const vehicleIds = await mongoose.connection.db.collection('vehicles').find({}, { projection: { _id: 1, driverId: 1 } }).toArray();

    setInterval(async () => {
      const lat = parseFloat((Math.random() * (26.3 - 25.8) + 25.8).toFixed(6));
      const lon = parseFloat((Math.random() * (50.7 - 50.3) + 50.3).toFixed(6));

      // Select a random vehicle
      const randomVehicle = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];


      if (vehicleIds.length === 0) {
        console.error("No vehicles found in the database.");
        return; // Exit if no vehicles are found
      }
      const vehicleData = {
        vehicleId: randomVehicle._id, // Include vehicle ID
        driverId: randomVehicle.driverId, // Include driver ID
        speed: Math.floor(Math.random() * 150),
        fuelLevel: Math.floor(Math.random() * 100),
        location: {
          type: "Point",
          lon: lon, // Change to latitude
          lat: lat, // Change to longitude
        },
        timestamp: new Date().toISOString()
      };

      console.log("Generated Vehicle Data:", vehicleData);
      // Check for alerts and publish data
      if (vehicleData.speed > 100) {
        const speedAlert = {
          location: vehicleData.location,
          alertTime: new Date().toISOString(),
          alertType: "speedAlert",
          message: `Vehicle speed ${vehicleData.speed} km/h exceeds limit of 100 km/h`,
          details: { speed: vehicleData.speed },
        };
        channel.sendToQueue(alertQueue, Buffer.from(JSON.stringify(speedAlert)));
      }
      if (vehicleData.fuelLevel < 20) {
        const fuelAlert = {
          location: vehicleData.location,
          alertTime: new Date().toISOString(),
          alertType: "lowFuel",
          message: `Vehicle fuel level is critically low at ${vehicleData.fuelLevel}%`,
          details: { fuelLevel: vehicleData.fuelLevel },
        };
        channel.sendToQueue(alertQueue, Buffer.from(JSON.stringify(fuelAlert)));
      }

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(vehicleData)));
    }, 15000);
  } catch (error) {
    console.error("Error in Producer:", error);
  }
};

generateVehicleData();