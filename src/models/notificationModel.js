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

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
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
