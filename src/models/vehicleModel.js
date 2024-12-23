import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    brand: { type: String },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    plateNumber: { type: String, required: true, unique: true }, // Assuming there's a 'Driver' model
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

vehicleSchema.index({ driverId: 1, plateNumber: 1 }, { unique: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
// export def

export default Vehicle;
