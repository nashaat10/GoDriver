import NotificationToken from "../models/notificationModel.js";
import catchAsync from "../utils/catchAsync.js";

export const createOne = catchAsync(async (req, res, next) => {
  const { clientId, id: userId } = req.user;
  const { token } = req.body;
  const notificationToken = await NotificationToken.create({
    userId,
    token,
    clientId,
  });
  res.status(201).json({
    status: "success",
    data: {
      notificationToken,
    },
  });
});

export const getAll = catchAsync(async (req, res, next) => {
  const notificationTokens = await NotificationToken.find();
  res.status(200).json({
    status: "success",
    results: notificationTokens.length,
    data: {
      notificationTokens,
    },
  });
});
