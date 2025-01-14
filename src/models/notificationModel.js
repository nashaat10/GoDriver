import mongoose from "mongoose";

const notificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NotificationToken = mongoose.model(
  "NotificationToken",
  notificationTokenSchema
);

export default NotificationToken;
