import { Alert } from "../models/vehicleData.js";
import Vehicle from "../models/vehicleModel.js";

export const processAlert = async (alertData) => {
  try {
    // Get a random vehicle using efficient MongoDB sampling
    const randomVehicleArray = await Vehicle.aggregate([
      { $sample: { size: 1 } },
      { $project: { _id: 1, driverId: 1 } },
    ]);

    if (randomVehicleArray.length === 0) {
      throw new Error("No vehicles available in the database");
    }

    const randomVehicle = randomVehicleArray[0];

    // Assign alert to the randomly selected vehicle
    const alertWithVehicle = {
      ...alertData,
      driverId: randomVehicle.driverId,
      vehicleId: randomVehicle._id,
    };

    // Create and save the alert
    const newAlert = new Alert(alertWithVehicle);
    const savedAlert = await newAlert.save();

    return savedAlert;
  } catch (error) {
    console.error("Error processing alert:", error);
    throw error; // Re-throw to let the caller handle it
  }
};
