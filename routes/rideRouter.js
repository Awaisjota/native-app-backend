import express from "express";

import {
  createRide,
  deleteRide,
  getRides,
  getSingleRide,
  updateRide,
  getMyRides,
  completeRide,
  addComment,
  getComments,
} from "../controllers/rideController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   MIDDLEWARE GROUP
========================= */
const auth = protect;

/* =========================
   RIDES (CORE)
========================= */

// My rides (user specific)
router.get("/my-rides", auth, getMyRides);

// All rides
router.get("/", auth, getRides);

// Create ride
router.post("/", auth, createRide);

// Single ride
router.get("/:id", auth, getSingleRide);

// Update ride
router.put("/:id", auth, updateRide);

// Delete rides
router.delete("/:id", auth, deleteRide);

// Complete ride
router.put("/:id/complete", auth, completeRide);

/* =========================
   COMMENTS
========================= */

// Add comment
router.post("/:id/comments", auth, addComment);

// Get comments
router.get("/:id/comments", auth, getComments);

export default router;