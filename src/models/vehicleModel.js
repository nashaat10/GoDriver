import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    plateNumber: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },

    toObject: { virtuals: true, versionKey: false },
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
// export def

export default Vehicle;
