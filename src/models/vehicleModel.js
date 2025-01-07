import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    isAvailable: { type: Boolean, default: false },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    plateNumber: { type: String, required: true, index: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },

    toObject: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
