import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    // 👤 Owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🚦 Role
    type: {
      type: String,
      enum: ["driver", "passenger"],
      required: true,
    },

    // 📍 Route
    from: {
      type: String,
      enum: [
        "Islamabad",
        "Murree",
        "Muzaffarabad",
        "Bagh",
        "Haveli",
        "Abbaspur",
        "Rawalakot",
        "Hajira",
        "Kotli",
        "Azad Pattan",
        "Jhelum",
        "Mirpur",
      ],
      required: true,
    },

    to: {
      type: String,
      enum: [
        "Islamabad",
        "Murree",
        "Muzaffarabad",
        "Bagh",
        "Haveli",
        "Abbaspur",
        "Rawalakot",
        "Hajira",
        "Kotli",
        "Azad Pattan",
        "Jhelum",
        "Mirpur",
      ],
      required: true,
    },

    // 📅 Schedule
    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    // 🚗 Vehicle (driver only)
    vehicleType: {
      type: String,
      enum: ["Car", "Van", "Bike", "Wagnar", "Ambulance", "Special Car", "Other"],
    },

    // 💺 Seats (driver only)
    seats: {
      type: Number,
      min: 1,
    },

    // 📝 Description
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // 📞 Contact (main feature)
    contact: {
      type: String,
      required: true,
    },

    comments: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],
    // 📌 NEW SIMPLE STATUS SYSTEM
    isCompleted: {
      type: Boolean,
      default: false, // false = active ride
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);