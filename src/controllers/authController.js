import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import sendEmail from "../utils/email.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: "../../config.env" });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  } else {
    cookieOptions.secure = false;
  }

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  return res.status(statusCode).json({
    status: "success",
    token,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  // req.body.role = "manager";
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2) Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const logout = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .json({ status: "success", message: "User logged out successfully" });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  const verificationCode = user.createVerificationCode();
  await user.save({ validateBeforeSave: false });

  const message = `Forgot your password? Use the following verification code to reset your password: ${verificationCode}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your password verification code (valid for 10 min)",
      message,
      otp: verificationCode,
    });
    res.status(200).json({
      status: "success",
      message: "Verification code sent to email!",
    });
  } catch (err) {
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

export const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const hashedCode = crypto.createHash("sha256").update(otp).digest("hex");
  if (
    user.verificationCode !== hashedCode ||
    user.verificationCodeExpires < Date.now()
  ) {
    return next(new AppError("Invalid or expired OTP.", 400));
  }

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully.",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const hashedCode = crypto.createHash("sha256").update(otp).digest("hex");
  if (
    user.verificationCode !== hashedCode ||
    user.verificationCodeExpires < Date.now()
  ) {
    return next(new AppError("Invalid or expired OTP.", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});
