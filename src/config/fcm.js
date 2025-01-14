import fs from "fs";
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

export let fcmMessaging;
const init = async () => {
  try {
    const fcmPath = `${process.cwd()}/fcm.json`;

    if (!fs.existsSync(fcmPath)) {
      throw new Error("FCM file not found");
    }

    const fcm = JSON.parse(fs.readFileSync(fcmPath, "utf8"));

    const fcmApp = initializeApp({
      credential: admin.credential.cert(fcm),
    });

    fcmMessaging = getMessaging(fcmApp);
  } catch (error) {
    throw error;
  }
};

export default init;
