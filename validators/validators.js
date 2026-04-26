import { body } from "express-validator";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ================= REGISTER =================
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });
      if (existingUser) {
        throw new Error("Email already in use");
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 6 })
    .withMessage("Minimum 6 characters required")
    .matches(/\d/)
    .withMessage("Must contain at least one number"),

  body("contactNumber")
    .notEmpty()
    .withMessage("Contact number is required")
    .isMobilePhone("en-PK")
    .withMessage("Invalid contact number format"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

];

// ================= LOGIN =================
export const loginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// ================= FORGOT =================
export const forgotValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email"),
];

// ================= RESET =================
export const resetValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email"),

  body("otp")
    .notEmpty()
    .withMessage("OTP is required!")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 characters"),

  body("newPassword")
  .notEmpty().withMessage("Password is required!")
  .isLength({ min: 6 }).withMessage("Minimum 6 characters required")
  .matches(/\d/).withMessage("Must contain at least one number"),
];