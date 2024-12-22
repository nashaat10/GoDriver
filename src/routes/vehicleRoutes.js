import express from 'express';
import Vehicle from '../models/vehicleModel.js';  // Import the Vehicle model
<<<<<<< Updated upstream
import { getVehicleData } from '../controllers/vehicleController.js';
=======
import { getVehicleData, searchVehicleByPlateNumber , createVehicle, getAllVehicles } from '../controllers/vehicleController.js';
>>>>>>> Stashed changes

const router = express.Router();

router.route('/').get(getAllVehicles).post(createVehicle);
// Get vehicle by ID
router.get('/:id', getVehicleData);

// Create a new vehicle
<<<<<<< Updated upstream
router.post('/', async (req, res) => {
  try {
    const { make, model, year, driverId, plateNumber } = req.body;

    // Create a new vehicle document
    const vehicle = new Vehicle({
      make,
      model,
      year,
      driverId,
      plateNumber,
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

=======
// router.post('/', createVehicle);
    
>>>>>>> Stashed changes
// Search for a vehicle by plate number
router.get('/search/:plateNumber', async (req, res) => {
  try {
    const { plateNumber } = req.params;
    const vehicle = await Vehicle.findOne({ plateNumber });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        vehicle
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search for vehicle', details: error.message });
  }
});


// router.get('/search/driver/:name', async (req, res) => {
//   try {
//     const { name } = req.params;
//     const drivers = await User.find({ name: new RegExp(name, 'i') }).select('_id');
//     const driverIds = drivers.map(driver => driver._id);

//     const vehicles = await Vehicle.find({ driverId: { $in: driverIds } }).populate('driverId', 'name');

//     if (vehicles.length === 0) {
//       return res.status(404).json({ message: 'No vehicles found for the given driver name' });
//     }

//     res.status(200).json({
//       status: 'success',
//       results: vehicles.length,
//       data: {
//         vehicles
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to search for vehicles by driver name', details: error.message });
//   }
// });

export default router;