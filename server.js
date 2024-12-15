import server from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";


dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE_URL;

mongoose.connect(DB).then(() => {
  console.log("Database connection successful");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

