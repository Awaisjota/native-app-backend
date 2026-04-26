import Ride from "../models/Ride.js";
import {getIO} from "../socket/socket.js";
/* =======================================
   CREATE RIDE
======================================= */
export const createRide = async (req, res) => {
  try {
    // // console.log("BODY:", req.body);
    // // console.log("USER:", req.user);
    const newRide = await Ride.create({
      ...req.body,
      user: req.user._id,
    });

    const ride = await newRide.populate("user", "name email");

    // Emit event to all connected clients
    const io = getIO();
    io.to("rides").emit("rideCreated", ride);

    res.status(201).json({
      message: "Ride created successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================
   GET ALL RIDES
======================================= */
export const getRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================
   GET SINGLE RIDE
======================================= */
export const getSingleRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("user", "name email")
      .populate("comments.user", "name"); // 🔥 added

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================
   GET MY RIDES
======================================= */
export const getMyRides = async (req, res) => {
  try {
    // console.log("USER IN REQUEST:", req.user);
    if (!req.user) {
      return res.status(401).json({ message: "User not found in request" });
    }

    const rides = await Ride.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    // console.log("MY RIDES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
/* =======================================
   UPDATE RIDE (ONLY OWNER)
======================================= */
export const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🚫 Prevent editing completed rides
    if (ride.isCompleted) {
      return res.status(400).json({ message: "Ride already completed" });
    }

    // 🔐 prevent manual status hack
    delete req.body.isCompleted;

    const newUpdatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    const updatedRide = await newUpdatedRide.populate("user", "name email");

    // Emit event to all connected clients
    const io = getIO();
    io.to("rides").emit("rideUpdated", updatedRide);


    res.status(200).json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================
   DELETE RIDE
======================================= */
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

    // Emit event to all connected clients
    const io = getIO();
    io.to("rides").emit("rideDeleted", ride);

    res.status(200).json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================
   COMPLETE RIDE
======================================= */
export const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    ride.isCompleted = true;
    await ride.save();

    // Emit event to all connected clients
    const io = getIO();
    io.to("rides").emit("rideCompleted", ride);


    res.status(200).json({
      message: "Ride marked as completed",
      ride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================================
   ADD COMMENT
======================================= */
export const addComment = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.body.text?.trim()) {
      return res.status(400).json({ message: "Comment required" });
    }

    // 🔥 ensure array
    if (!Array.isArray(ride.comments)) {
      ride.comments = [];
    }

    // new comment
    const newComment = {
      user: req.user._id,
      text: req.body.text.trim(),
      createdAt: new Date(),
    };

    ride.comments.unshift(newComment);

    // save
    await ride.save();

    // 🔥 RE-FETCH (FIX FOR REALTIME + POPULATE ISSUE)
    const updatedRide = await Ride.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    const latestComment = updatedRide.comments[0];

    // socket
    const io = getIO();

const commentPayload = {
  ...latestComment.toObject?.() || latestComment,
  rideId: req.params.id,
};

io.to(req.params.id).emit("commentAdded", commentPayload);

return res.status(201).json(commentPayload)

  } catch (error) {
    // console.log("COMMENT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
/* =======================================
   GET COMMENTS
======================================= */
export const getComments = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      "comments.user",
      "name",
    );

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.status(200).json(ride.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
