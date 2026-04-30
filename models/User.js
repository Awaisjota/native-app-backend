import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    contactNumber: { type: String, required: true, trim: true },

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

    isBlocked: {
      type: Boolean,
      default: false,
    },

    city: {
      type: String,
      required: true,
    },

    address: String,

    profileImage: {
      type: String,
      default: "",
    },

    refreshToken: String,

    tokenVersion: {
      type: Number,
      default: 0,
    },

    expoPushToken: {
      type: String,
      default: null,
    },

    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true },
);

/* ❌ REMOVE THIS IF YOU HAVE IT ANYWHERE:
userSchema.index({ email: 1 });
userSchema.index({ isBlocked: 1 });
*/

export default mongoose.model("User", userSchema);
