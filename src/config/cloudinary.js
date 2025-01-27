import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });

cloudinary.v2.config({
  cloud_name: "db3rwgkan",
  api_key: "835868578195358",
  api_secret: "PZc_rlmffakBBa6tQtonM8blajc",
});

export default cloudinary;
