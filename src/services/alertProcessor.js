import { Alert } from "../models/vehicleData.js";
import Vehicle from "../models/vehicleModel.js";

export const processAlert = async (alertData) => {
  try {
    const vehicles = await Vehicle.find({}, "_id driverId");
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    alertData.driverId = randomVehicle.driverId;
    alertData.vehicleId = randomVehicle._id;

    const newAlert = new Alert(alertData);
    const savedAlert = await newAlert.save();

    return savedAlert;
  } catch (error) {
    console.error("Error processing alert:", error);
    throw error;
  }
};
