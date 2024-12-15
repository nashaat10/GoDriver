import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import express from "express";
import User from "../models/userModel.js"; // Import the User model
import catchAsync from "../utils/catchAsync.js"; // Import catchAsync utility

const router = express.Router();

router.use(authController.protect);

router
  .route("/drivers")
  .get(authController.restrictTo("manager"), userController.getAllDrivers)
  .post(authController.restrictTo("manager"), userController.createDriver);

router.route("/me").get(userController.getMe, userController.getUser);
router
  .route("/updateMe")
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.route("/deleteMe").patch(userController.deleteMe);

router.use(authController.restrictTo("manager"));
router
  .route("/drivers/:id")
  .get(userController.getUser)
  .patch(userController.updateDriver)
  .delete(userController.deleteDriver);

// Search for drivers by name
router.get('/search/drivers/:name', catchAsync(async (req, res) => {
  const { name } = req.params;
  const drivers = await User.find({ name: new RegExp(name, 'i'), role: 'driver' });

  if (drivers.length === 0) {
    return res.status(404).json({ message: 'No drivers found with that name' });
  }

  res.status(200).json({
    status: 'success',
    results: drivers.length,
    data: {
      drivers,
    },
  });
}));

export default router;