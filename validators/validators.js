import { body } from "express-validator";

/* ================= REGISTER ================= */
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Min 3 characters"),

  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Min 6 chars")
    .matches(/^(?=.*[0-9])(?=.*[a-zA-Z]).{6,}$/)
    .withMessage("Must contain letters & numbers"),

  body("contactNumber")
    .notEmpty()
    .withMessage("Contact required")
    .isMobilePhone()
    .withMessage("Invalid number"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City required"),
];

/* ================= LOGIN ================= */
export const loginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email required")
    .isEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password required"),
];

/* ================= FORGOT ================= */
export const forgotValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email required")
    .isEmail(),
];

/* ================= RESET ================= */
export const resetValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email required")
    .isEmail(),

  body("otp")
    .notEmpty()
    .withMessage("OTP required")
    .matches(/^\d{6}$/)
    .withMessage("OTP must be 6 digits"),

  body("newPassword")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Min 6 characters"),
];