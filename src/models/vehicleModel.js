import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true }, // Assuming there's a 'Driver' model
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
