import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "../../config.env" });

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Admin <> ",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
