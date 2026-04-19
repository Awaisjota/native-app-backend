import express from "express";

import {
  forgotValidation,
  loginValidation,
  registerValidation,
  resetValidation,
} from "../validators/validators.js";

import {
  forgotPassword,
  getAllUsers,
  login,
  logout,
  register,
  resetPassword,
  refreshTokenHandler,
} from "../controllers/authControllers.js";

import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ================= AUTH =================
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/forgot-password", forgotValidation, validate, forgotPassword);
router.post("/reset-password", resetValidation, validate, resetPassword);

// ================= TOKEN =================
router.post("/refresh-token", refreshTokenHandler);

// ================= LOGOUT =================
router.post("/logout", protect, logout);

// ================= ADMIN ROUTE (INLINE FIX) =================
router.get(
  "/admin",
  protect,
  allowRoles("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Access granted to admin route",
      user: req.user,
    });
  }
);

// ================= USERS =================
router.get("/users", protect, allowRoles("admin"), getAllUsers);

export default router;