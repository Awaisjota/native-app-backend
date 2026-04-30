import User from "../models/User.js";
import Ride from "../models/Ride.js";

/* =========================
   🔧 HELPERS
========================= */
const errorRes = (res, error, status = 500) => {
  return res.status(status).json({
    message: error?.message || "Server error",
  });
};

/* =========================
   📊 DASHBOARD STATS
========================= */
export const getAdminStats = async (req, res) => {
  try {
    const [users, rides, activeRides, completedRides] =
      await Promise.all([
        User.countDocuments(),
        Ride.countDocuments(),
        Ride.countDocuments({ isCompleted: false }),
        Ride.countDocuments({ isCompleted: true }),
      ]);

    return res.json({
      users,
      rides,
      activeRides,
      completedRides,
    });
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   👤 GET ALL USERS (WITH RIDES COUNT)
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "rides",
          localField: "_id",
          foreignField: "user",
          as: "rides",
        },
      },
      {
        $addFields: {
          ridesCount: { $size: "$rides" },

          driverRidesCount: {
            $size: {
              $filter: {
                input: "$rides",
                as: "r",
                cond: { $eq: ["$$r.type", "driver"] },
              },
            },
          },

          passengerRidesCount: {
            $size: {
              $filter: {
                input: "$rides",
                as: "r",
                cond: { $eq: ["$$r.type", "passenger"] },
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          otp: 0,
          otpExpiry: 0,
          rides: 0,
        },
      },
    ]);

    return res.status(200).json(users);
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   🔍 SEARCH USERS
========================= */
export const searchUsers = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const users = await User.find({
      name: { $regex: keyword, $options: "i" },
    }).select("-password -refreshToken -otp -otpExpiry");

    return res.json(users);
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   👤 USER DETAILS
========================= */
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken -otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rides = await Ride.find({ user: user._id }).sort({
      createdAt: -1,
    });

    const stats = {
      ridesCount: rides.length,
      driverRidesCount: rides.filter((r) => r.type === "driver").length,
      passengerRidesCount: rides.filter((r) => r.type === "passenger").length,
      completedRides: rides.filter((r) => r.isCompleted).length,
      activeRides: rides.filter((r) => !r.isCompleted).length,
    };

    return res.json({
      ...user.toObject(),
      rides,
      ...stats,
    });
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   🚗 GET ALL RIDES
========================= */
export const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.json(rides);
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   🔄 UPDATE RIDE STATUS
========================= */
export const updateRideStatus = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.isCompleted = Boolean(req.body.isCompleted);
    await ride.save();

    return res.json({
      message: "Ride updated",
      ride,
    });
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   ❌ DELETE RIDE
========================= */
export const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    await ride.deleteOne();

    return res.json({
      message: "Ride deleted successfully",
    });
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   ⛔ BLOCK USER
========================= */
export const blockUser = async (req, res) => {
  try {
    const adminId = req.user?._id?.toString();
    const targetId = req.params.id;

    if (adminId === targetId) {
      return res.status(400).json({
        message: "You cannot block yourself",
      });
    }

    const user = await User.findById(targetId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = true;
    await user.save();

    return res.json({ message: "User blocked" });
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   ✅ UNBLOCK USER
========================= */
export const unblockUser = async (req, res) => {
  try {
    const adminId = req.user?._id?.toString();
    const targetId = req.params.id;

    if (adminId === targetId) {
      return res.status(400).json({
        message: "You cannot modify yourself",
      });
    }

    const user = await User.findById(targetId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = false;
    await user.save();

    return res.json({ message: "User unblocked" });
  } catch (err) {
    return errorRes(res, err);
  }
};