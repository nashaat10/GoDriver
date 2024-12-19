import express from "express";
import * as clientController from "../controllers/clientController.js";

const router = express.Router();

router.route("/").post(clientController.createClient);
router.route("/drivers/:clientId").get(clientController.getAllDriversForClient);
router
  .route("/managers/:clientId")
  .get(clientController.getAllManagersForClient);

router.route("/admins/:clientId").get(clientController.getAllAdminsForClient);

export default router;
