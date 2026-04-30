import Ride from "../models/Ride.js";
import User from "../models/User.js";
import { getIO } from "../socket/socket.js";
import { sendExpoPushNotification } from "../services/expoPushService.js";
/* =========================
   🔧 ERROR HELPER
========================= */
const errorRes = (res, error, status = 500) => {
  return res.status(status).json({
    message: error?.message || "Server error",
  });
};

/* =========================
   🚗 CREATE RIDE
========================= */
export const createRide = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const ride = await Ride.create({
      ...req.body,
      user: req.user._id,
    });

    const populatedRide = await ride.populate("user", "name email");

    // Socket realtime update
    getIO().to("rides").emit("rideCreated", populatedRide);

    // Push notification to all users except creator (optional)
    const users = await User.find({
      expoPushToken: { $ne: null },
      _id: { $ne: req.user._id }, // creator ko skip karna ho to
    }).select("expoPushToken");

    await sendExpoPushNotification({
      tokens: users.map((u) => u.expoPushToken),
      title: "🚗 New Ride Posted",
      body: `${ride.from} → ${ride.to}`,
      data: {
        type: "ride_created",
        rideId: ride._id,
      },
    });

    return res.status(201).json({
      message: "Ride created successfully",
      ride: populatedRide,
    });
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   📥 GET ALL RIDES
========================= */
export const getRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    return res.json(rides);
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   📄 SINGLE RIDE
========================= */
export const getSingleRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("user", "name email")
      .populate("comments.user", "name");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    return res.json(ride);
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   🙋 MY RIDES
========================= */
export const getMyRides = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rides = await Ride.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json(rides);
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   ✏️ UPDATE RIDE
========================= */
export const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (ride.isCompleted) {
      return res.status(400).json({ message: "Ride already completed" });
    }

    delete req.body.isCompleted;

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("user", "name email");

    getIO().to("rides").emit("rideUpdated", updatedRide);

    return res.json(updatedRide);
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

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await ride.deleteOne();

    getIO().to("rides").emit("rideDeleted", { _id: ride._id });

    return res.json({ message: "Ride deleted successfully" });
  } catch (err) {
    return errorRes(res, err);
  }
};

/* =========================
   ✅ COMPLETE RIDE
========================= */
export const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // 🔒 safety check
    if (!ride.user) {
      return res.status(400).json({ message: "Ride user missing" });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    ride.isCompleted = true;
    await ride.save();

    // 🔥 SAFE SOCKET EMIT
    if (typeof getIO === "function") {
      getIO().to("rides").emit("rideCompleted", ride);
    }

    return res.json({
      message: "Ride completed",
      ride,
    });
  } catch (err) {
    console.log("COMPLETE RIDE ERROR:", err); // 👈 important
    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};
/* =========================
   💬 ADD COMMENT
========================= */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment required" });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const comment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    if (!Array.isArray(ride.comments)) {
      ride.comments = [];
    }

    ride.comments.unshift(comment);

    await ride.save();

    const updatedRide = await Ride.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    const latestComment = updatedRide?.comments?.[0];

    if (!latestComment) {
      return res.status(500).json({ message: "Comment creation failed" });
    }

    const payload = {
      ...latestComment.toObject?.(),
      rideId: req.params.id,
    };

    // 🔥 SAFE SOCKET EMIT (NO CRASH IF SOCKET FAILS)
    try {
      const io = getIO();
      if (io) {
        io.to(req.params.id).emit("commentAdded", payload);
      }
    } catch (socketErr) {
      console.log("Socket emit error:", socketErr.message);
    }

    return res.status(201).json(payload);
  } catch (err) {
    console.log("ADD COMMENT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   📥 GET COMMENTS
========================= */
export const getComments = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const comments = Array.isArray(ride.comments)
      ? ride.comments
      : [];

    // 🔥 latest first (important for UI consistency)
    comments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json(comments);
  } catch (err) {
    console.log("GET COMMENTS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};