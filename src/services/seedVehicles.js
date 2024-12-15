import mongoose from "mongoose";
import Vehicle from "../models/vehicleModel.js"; // Your Vehicle model
import User from "../models/userModel.js"; // Import the User model

const fetchDriverIds = async () => {
  try {
    const drivers = await User.find({ role: "driver" }).select("_id");
    return drivers.map(driver => driver._id);
  } catch (error) {
    console.error("Error fetching driver IDs:", error);
    return [];
  }
};


const seedVehicles = async () => {
  try {
    // Connect to MongoDB
    const DB = process.env.DATABASE_URL;
    await mongoose.connect('mongodb+srv://bawq2024:bawq2024@godriver.94a2j.mongodb.net/?retryWrites=true&w=majority&appName=GoDriver');
    console.log("Connected to MongoDB");

    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log("Cleared existing vehicles");

    // Fetch driver IDs
 const driverIds = await fetchDriverIds();
 console.log("Fetched Driver IDs:", driverIds);

 if (driverIds.length === 0) {
   console.log("No drivers found. Cannot seed vehicles.");
   return;
 }

 // Ensure there are enough driver IDs
 if (driverIds.length < 10) {
   console.log("Not enough driver IDs to seed vehicles.");
   return;
 }

 // Sample vehicle data with driver IDs
 const generateRandomPlateNumber = () => {
   const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   const numbers = "0123456789";
   let plate = "";
   for (let i = 0; i < 3; i++) {
     plate += letters.charAt(Math.floor(Math.random() * letters.length));
   }
   plate += "-";
   for (let i = 0; i < 4; i++) {
     plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
   }
   return plate;
 };

 const vehicles = [
   { brand: "Toyota", model: "Corolla", year: 2019, driverId: driverIds[0], plateNumber: generateRandomPlateNumber() },
   { brand: "Ford", model: "Focus", year: 2020, driverId: driverIds[1], plateNumber: generateRandomPlateNumber() },
   { brand: "Honda", model: "Civic", year: 2021, driverId: driverIds[2], plateNumber: generateRandomPlateNumber() },
   { brand: "Tesla", model: "Model 3", year: 2022, driverId: driverIds[3], plateNumber: generateRandomPlateNumber() },
   { brand: "BMW", model: "3 Series", year: 2020, driverId: driverIds[4], plateNumber: generateRandomPlateNumber() },
   { brand: "Mercedes", model: "C-Class", year: 2021, driverId: driverIds[5], plateNumber: generateRandomPlateNumber() },
   { brand: "Audi", model: "A4", year: 2019, driverId: driverIds[6], plateNumber: generateRandomPlateNumber() },
   { brand: "Volkswagen", model: "Golf", year: 2020, driverId: driverIds[7], plateNumber: generateRandomPlateNumber() },
   { brand: "Hyundai", model: "Elantra", year: 2022, driverId: driverIds[8], plateNumber: generateRandomPlateNumber() },
   { brand: "Nissan", model: "Altima", year: 2021, driverId: driverIds[9], plateNumber: generateRandomPlateNumber() }
 ];

 // Insert sample vehicles
 await Vehicle.insertMany(vehicles);
 console.log("Sample vehicles added to database");

 mongoose.connection.close();
} catch (error) {
 console.error("Error seeding vehicles:", error);
}
};

seedVehicles();