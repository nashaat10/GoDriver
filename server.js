import app from "./app.js";

import dotenv from "dotenv";

import mongoose from "mongoose";

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE_URL;

mongoose.connect(DB).then(() => {
  console.log("Database connection successful");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
