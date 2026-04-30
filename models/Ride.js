import mongoose from "mongoose";

const locations = [
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
];

const rideSchema = new mongoose.Schema(
  {
    /* =========================
       👤 OWNER
    ========================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       🚦 TYPE
    ========================= */
    type: {
      type: String,
      enum: ["driver", "passenger"],
      required: true,
      index: true,
    },

    /* =========================
       📍 ROUTE
    ========================= */
    from: {
      type: String,
      enum: locations,
      required: true,
      index: true,
    },

    to: {
      type: String,
      enum: locations,
      required: true,
      index: true,
    },

    /* =========================
       📅 SCHEDULE
    ========================= */
    date: {
      type: Date,
      required: true,
      index: true,
    },

    time: {
      type: String,
      required: true,
    },

    /* =========================
       🚗 VEHICLE
    ========================= */
    vehicleType: {
      type: String,
      enum: ["Car", "Van", "Bike", "Wagnar", "Ambulance", "Special Car", "Other"],
      default: "Car",
    },

    /* =========================
       💺 SEATS
    ========================= */
    seats: {
      type: Number,
      min: 1,
      default: 1,
    },

    /* =========================
       📝 DETAILS
    ========================= */
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       💬 COMMENTS
    ========================= */
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

    /* =========================
       📌 STATUS
    ========================= */
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   ⚡ INDEXES (PERFORMANCE)
========================= */
rideSchema.index({ from: 1, to: 1 });
rideSchema.index({ createdAt: -1 });

export default mongoose.model("Ride", rideSchema);