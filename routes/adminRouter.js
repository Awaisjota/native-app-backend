import express from "express";

import {
  getAdminStats,
  getAllUsers,
  getAllRides,
  deleteRide,
  blockUser,
  unblockUser,
  searchUsers,
  getUserDetails,
  updateRideStatus,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const adminRouter = express.Router();

// 🔐 Global admin guard (clean approach)
const adminOnly = [protect, allowRoles("admin")];



/* =========================
   📊 STATS
========================= */
adminRouter.get("/stats", adminOnly, getAdminStats);


/* =========================
   👤 USERS
========================= */
adminRouter.get("/users", adminOnly, getAllUsers);

adminRouter.get("/users/search", adminOnly, searchUsers);

adminRouter.get("/users/:id", adminOnly, getUserDetails);

adminRouter.put("/users/:id/block", adminOnly, blockUser);

adminRouter.put("/users/:id/unblock", adminOnly, unblockUser);



/* =========================
   🚗 RIDES
========================= */
adminRouter.get("/rides", adminOnly, getAllRides);

adminRouter.put("/rides/:id", adminOnly, updateRideStatus);

adminRouter.delete("/rides/:id", adminOnly, deleteRide);

export default adminRouter;