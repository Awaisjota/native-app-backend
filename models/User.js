import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // 📍 Location
    city: {
      type: String,
      required: true,
    },

    address: {
      type: String, // optional
    },


    // 📸 Profile Image (optional)
    profileImage: {
      type: String,
      default: "",
    },

    // 🔐 Auth
    refreshToken: String,

    tokenVersion: {
      type: Number,
      default: 0,
    },

    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);