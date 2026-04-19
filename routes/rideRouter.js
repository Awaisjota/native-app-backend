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

/* =======================================
   RIDES
======================================= */

// GET MY RIDES
router.get("/rides/my-rides", protect, getMyRides);


// GET ALL RIDES
router.get("/rides", protect, getRides);


// GET SINGLE RIDE (DETAIL PAGE)
router.get("/rides/:id", protect, getSingleRide);

// CREATE RIDE
router.post("/rides", protect, createRide);

// UPDATE RIDE
router.put("/rides/:id", protect, updateRide);

// DELETE RIDE
router.delete("/rides/:id", protect, deleteRide);

// COMPLETE RIDE (NEW 🔥)
router.put("/rides/:id/complete", protect, completeRide);




/* =======================================
   COMMENTS
======================================= */

// ADD COMMENT
router.post("/rides/:id/comment", protect, addComment);

// GET COMMENTS
router.get("/rides/:id/comments", protect, getComments);


export default router;