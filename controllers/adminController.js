import User from "../models/User.js";

// =========================
// 👑 GET ALL USERS (ADMIN)
// =========================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// =========================
// 👑 GET DASHBOARD STATS
// =========================
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const admins = await User.countDocuments({ role: "admin" });
    const normalUsers = await User.countDocuments({ role: "user" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        admins,
        normalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load stats",
    });
  }
};