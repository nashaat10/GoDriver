import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "../../config.env" });

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>OTP Verification</h2>
        <p>Dear user,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h3 style="color: #ff6600;">${options.otp}</h3>
        <p>Please use this OTP to complete your verification. This OTP is valid for 10 minutes.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <p>Best regards,<br/>Admin</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
