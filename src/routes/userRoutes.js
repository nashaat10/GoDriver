import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import express from "express";
const router = express.Router();

router.use(authController.protect);

router
  .route("/drivers")
  .get(
    authController.restrictTo("admin", "manager"),
    userController.getAllDrivers
  )
  .post(authController.restrictTo("admin"), userController.createDriver);

router.route("/me").get(userController.getMe, userController.getUser);
router
  .route("/updateMe")
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.route("/deleteMe").patch(userController.deleteMe);

router.use(authController.restrictTo("admin", "manager"));
router
  .route("/drivers/:id")
  .get(userController.getUser)
  .patch(userController.updateDriver)
  .delete(userController.deleteDriver);
export default router;
