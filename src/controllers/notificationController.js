import { fcmMessaging } from "../config/fcm.js";
import NotificationToken from "../models/notificationModel.js";
import catchAsync from "../utils/catchAsync.js";

export const sendNotification = catchAsync(async (req, res, next) => {
  const { title, body } = req.body;
  const userId = req.user.id;

  const notificationToken = await NotificationToken.findOne({ userId });

  if (!notificationToken) {
    return res.status(404).json({
      status: "fail",
      message: "Notification token not found for the user",
    });
  }

  const message = {
    token: notificationToken.token,
    notification: {
      title,
      body,
    },
  };

  await fcmMessaging.send(message);

  res.status(200).json({
    status: "success",
    message: "Notification sent successfully",
  });
});
