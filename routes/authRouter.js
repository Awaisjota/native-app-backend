import express from "express";

import {
  forgotValidation,
  loginValidation,
  registerValidation,
  resetValidation,
} from "../validators/validators.js";

import {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshTokenHandler,
  logout,
  getMyProfile,
  updateProfile,
  getAllUsers,
  savePushToken,
} from "../controllers/authControllers.js";

import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =========================
   AUTH
========================= */
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

router.post("/forgot-password", forgotValidation, validate, forgotPassword);
router.post("/reset-password", resetValidation, validate, resetPassword);

/* =========================
   TOKEN
========================= */
router.post("/refresh-token", refreshTokenHandler);
router.post("/save-push-token", protect, savePushToken);
/* =========================
   USER SESSION
========================= */
router.post("/logout", protect, logout);

router.get("/me", protect, getMyProfile);

router.put("/me", protect, updateProfile);

/* =========================
   ADMIN CHECK (clean test route)
========================= */
router.get(
  "/admin/test",
  protect,
  allowRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
    });
  }
);

/* =========================
   ADMIN USERS (OPTIONAL)
========================= */
router.get("/users", protect, allowRoles("admin"), getAllUsers);




export default router;