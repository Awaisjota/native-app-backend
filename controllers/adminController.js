import User from "../models/User.js";
import Ride from "../models/Ride.js";

/* =========================
   📊 DASHBOARD STATS
========================= */
export const getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const rides = await Ride.countDocuments();

    const activeRides = await Ride.countDocuments({
      isCompleted: false,
    });

    const completedRides = await Ride.countDocuments({
      isCompleted: true,
    });

    res.json({
      users,
      rides,
      activeRides,
      completedRides,
    });
  } catch (error) {
    // console.log("ADMIN STATS ERROR:", error);
    res.status(500).json({ message: error.message });
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
                as: "ride",
                cond: { $eq: ["$$ride.type", "driver"] },
              },
            },
          },

          passengerRidesCount: {
            $size: {
              $filter: {
                input: "$rides",
                as: "ride",
                cond: { $eq: ["$$ride.type", "passenger"] },
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          rides: 0,
          refreshToken: 0,
          otp: 0,
          otpExpiry: 0,
        },
      },
    ]);

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   🔍 SEARCH USERS
========================= */
export const searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;

    const users = await User.find({
      name: { $regex: keyword, $options: "i" },
    }).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   👤 GET USER DETAILS
========================= */
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken -otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const rides = await Ride.find({
      user: user._id,
    }).sort({ createdAt: -1 });

    const ridesCount = rides.length;

    const driverRidesCount = rides.filter(
      (ride) => ride.type === "driver"
    ).length;

    const passengerRidesCount = rides.filter(
      (ride) => ride.type === "passenger"
    ).length;

    const completedRides = rides.filter(
      (ride) => ride.isCompleted
    ).length;

    const activeRides = rides.filter(
      (ride) => !ride.isCompleted
    ).length;

    res.json({
      ...user.toObject(),

      rides,

      ridesCount,
      driverRidesCount,
      passengerRidesCount,
      completedRides,
      activeRides,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
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

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   🔄 UPDATE RIDE STATUS
========================= */
export const updateRideStatus = async (req, res) => {
  try {
    const { isCompleted } = req.body;

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.isCompleted = isCompleted;
    await ride.save();

    res.json({ message: "Ride updated", ride });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    res.json({ message: "Ride deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   ⛔ BLOCK USER
========================= */
export const blockUser = async (req, res) => {
  try {
    const adminId = req.user._id.toString();
    const targetId = req.params.id;

    // ❌ Prevent self block
    if (adminId === targetId) {
      return res.status(400).json({
        message: "You cannot block your own account",
      });
    }

    const user = await User.findById(targetId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBlocked = true;
    await user.save();

    res.json({
      message: "User blocked",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* =========================
   ✅ UNBLOCK USER
========================= */
export const unblockUser = async (req, res) => {
  try {
    const adminId = req.user._id.toString();
    const targetId = req.params.id;

    // ❌ Prevent self-unblock/self-modify
    if (adminId === targetId) {
      return res.status(400).json({
        message: "You cannot modify your own block status",
      });
    }

    const user = await User.findById(targetId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBlocked = false;
    await user.save();

    res.json({
      message: "User unblocked successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};