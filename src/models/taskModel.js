import mongoose from "mongoose";
import moment from "moment";

// Create the Task schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task must have a title"],
    },
    description: {
      type: String,
      required: [true, "A task must have a description"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "delayed"],
      default: "pending",
    },
    startDate: {
      type: Date,
      required: [true, "A task must have a start date"],
    },
    deadline: {
      type: Date,
      required: [true, "A task must have an end date"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A task must have a manager"],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A task must have a driver"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
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

// taskSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "driverId",
//     select: "name email phone profilePicture",
//   });
//   next();
// });

const Task = mongoose.model("Task", taskSchema);

export default Task;
