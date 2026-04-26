import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getAllRides,
  deleteRide,
  blockUser,
  searchUsers,
  getUserDetails,
  updateRideStatus,
  unblockUser,
} from "../controllers/adminController.js";

import { allowRoles } from "../middleware/roleMiddleware.js";
import {protect} from "../middleware/authMiddleware.js";

const adminRouter = express.Router();

adminRouter.get("/stats", protect, allowRoles("admin"), getAdminStats);
adminRouter.get("/users", protect, allowRoles("admin"), getAllUsers);
adminRouter.get("/rides", protect, allowRoles("admin"), getAllRides);

adminRouter.delete("/ride/:id", protect, allowRoles("admin"), deleteRide);
adminRouter.put("/user/block/:id", protect, allowRoles("admin"), blockUser);

adminRouter.get("/users/search", protect, allowRoles("admin"), searchUsers);
adminRouter.get("/user/:id", protect, allowRoles("admin"), getUserDetails);

adminRouter.put("/ride/:id", protect, allowRoles("admin"), updateRideStatus);

adminRouter.put("/user/unblock/:id", protect, allowRoles("admin"), unblockUser);

export default adminRouter;