const generateVehicleData = async () => {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();
    const queue = "vehicle_data";
    const alertQueue = "alerts";
    await channel.assertQueue(queue);
    await channel.assertQueue(alertQueue);
    
    setInterval(async () => {
      const lat = parseFloat((Math.random() * (26.3 - 25.8) + 25.8).toFixed(6));
      const lon = parseFloat((Math.random() * (50.7 - 50.3) + 50.3).toFixed(6));
      
      const vehicleData = {
        speed: Math.floor(Math.random() * 150),
        fuelLevel: Math.floor(Math.random() * 100),
        location: {
          type: "Point",
          coordinates: [lat, lon],
        },
        timestamp: new Date().toISOString(),
        alerts: [],
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
