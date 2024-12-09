import express from 'express';
import Vehicle from '../models/vehicleModel.js';  // Import the Vehicle model
import { getVehicleData } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/:id', getVehicleData);

// Create a new vehicle
router.post('/', async (req, res) => {
  try {
    const { make, model, year, driverId } = req.body;

    // Create a new vehicle document
    const vehicle = new Vehicle({
      make,
      model,
      year,
      driverId,
    });

    const savedVehicle = await vehicle.save();

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: savedVehicle,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vehicle', details: error.message });
  }
});

export default router;

