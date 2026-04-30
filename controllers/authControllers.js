import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

/* =========================
   🔥 HELPERS (REUSABLE)
========================= */

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "15d" },
  );

const sendResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    message,
    ...(data && { data }),
  });
};

/* =========================
   🔹 REGISTER
========================= */
export const register = async (req, res) => {
  try {
    const { name, email, password, contactNumber, city } = req.body;

    if (!name || !email || !password || !contactNumber || !city) {
      return sendResponse(res, 400, "All fields required");
    }

    if (password.length < 6) {
      return sendResponse(res, 400, "Password too short");
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return sendResponse(res, 400, "User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      contactNumber,
      city,
      role: "user",
    });

    const { password: _, refreshToken, ...safeUser } = user._doc;

    return sendResponse(res, 201, "User created", safeUser);
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return sendResponse(res, 400, "Invalid credentials");

    if (user.isBlocked) return sendResponse(res, 403, "Account blocked");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendResponse(res, 400, "Invalid credentials");

  
    user.refreshToken = null;

    const token = signToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return sendResponse(res, 200, "Login success", {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 REFRESH TOKEN
========================= */
export const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendResponse(res, 401, "No refresh token");

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return sendResponse(res, 401, "Invalid refresh token");
    }

    const user = await User.findById(decoded.id);
    if (!user) return sendResponse(res, 401, "User not found");

    // strict match
    if (user.refreshToken !== refreshToken) {
      return sendResponse(res, 401, "Session expired");
    }

    const newAccessToken = signToken(user);

    // ⚡ IMPORTANT: DON'T rotate refresh token every time
    return res.status(200).json({
      message: "Token refreshed",
      data: {
        token: newAccessToken,
        refreshToken, // reuse SAME refresh token
      },
    });
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 LOGOUT
========================= */
export const logout = async (req, res) => {
  try {
    if (!req.user?._id) return sendResponse(res, 401, "Unauthorized");

    await User.findByIdAndUpdate(req.user._id, {
      refreshToken: null,
    });

    return sendResponse(res, 200, "Logged out");
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 CHANGE PASSWORD
========================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user?._id) return sendResponse(res, 401, "Unauthorized");

    if (!newPassword || newPassword.length < 6)
      return sendResponse(res, 400, "Weak password");

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return sendResponse(res, 404, "User not found");

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return sendResponse(res, 400, "Wrong password");

    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion += 1;
    user.refreshToken = null;

    await user.save();

    return sendResponse(res, 200, "Password updated");
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 FORGOT PASSWORD
========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    console.log("REQ BODY:", req.body);
console.log("EMAIL:", req.body?.email);
    if (!user) return sendResponse(res, 404, "User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail({ to: user.email, subject: "OTP Code", text: `Your OTP: ${otp}` });

    return sendResponse(res, 200, "OTP sent");
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 RESET PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return sendResponse(res, 404, "User not found");

    if (!user.otp || user.otp !== otp || user.otpExpiry < Date.now()) {
      return sendResponse(res, 400, "Invalid OTP");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return sendResponse(res, 200, "Password reset success");
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 USERS
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    return res.json(users);
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

/* =========================
   🔹 PROFILE
========================= */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select("-password");

    if (!user) return sendResponse(res, 404, "User not found");

    return res.json({ user });
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) return sendResponse(res, 404, "User not found");

    const { name, email, contactNumber, city } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (contactNumber !== undefined) user.contactNumber = contactNumber;
    if (city !== undefined) user.city = city;

    await user.save();

    return res.json({ user });
  } catch (err) {
    return sendResponse(res, 500, "Server error");
  }
};


export const savePushToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      expoPushToken: token,
    });

    res.json({ success: true, message: "Saved" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};