// controllers/rideController.js
const Ride = require("../models/Ride");

/* ================= USER ================= */

// Request a ride
const requestRide = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({ message: "Pickup and dropoff are required" });
    }

    const ride = await Ride.create({
      user: req.user._id,   // from authMiddleware (user token)
      pickup,
      dropoff,
      status: "requested",
    });

    res.status(201).json({
      message: "Ride requested successfully",
      ride,
    });
  } catch (err) {
    console.error("REQUEST RIDE ERROR:", err);
    res.status(500).json({ message: "Error requesting ride" });
  }
};

/* ================= DRIVER ================= */

// Get available rides
const getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: "requested" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    console.error("GET AVAILABLE RIDES ERROR:", err);
    res.status(500).json({ message: "Error fetching available rides" });
  }
};

// ✅ ACCEPT RIDE (FINAL FIX)
const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "requested") {
      return res.status(400).json({ message: "Ride already accepted" });
    }

    // ✅ IMPORTANT FIX
    ride.driver = req.user._id;   // driver token → authMiddleware
    ride.status = "accepted";

    await ride.save();

    res.json({
      message: "Ride accepted successfully",
      ride,
    });
  } catch (err) {
    console.error("ACCEPT RIDE ERROR:", err);
    res.status(500).json({ message: "Error accepting ride", error: err.message });
  }
};

// Update ride status (start / complete / cancel)
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["started", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid ride status" });
    }

    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.status = status;
    await ride.save();

    res.json({
      message: "Ride status updated",
      ride,
    });
  } catch (err) {
    console.error("UPDATE RIDE STATUS ERROR:", err);
    res.status(500).json({ message: "Error updating ride status" });
  }
};

// Driver ride history
const getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    console.error("GET DRIVER RIDES ERROR:", err);
    res.status(500).json({ message: "Error fetching driver rides" });
  }
};

// User ride history
const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id })
      .populate("driver", "name email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    console.error("GET USER RIDES ERROR:", err);
    res.status(500).json({ message: "Error fetching user rides" });
  }
};

/* ================= ADMIN ================= */

// Get all rides
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("user", "name email")
      .populate("driver", "name email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    console.error("GET ALL RIDES ERROR:", err);
    res.status(500).json({ message: "Error fetching rides" });
  }
};

// Get ride by ID
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate("user", "name email")
      .populate("driver", "name email");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (err) {
    console.error("GET RIDE BY ID ERROR:", err);
    res.status(500).json({ message: "Error fetching ride" });
  }
};

// Update ride by admin
const updateRideByAdmin = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      req.params.rideId,
      req.body,
      { new: true }
    )
      .populate("user", "name email")
      .populate("driver", "name email");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json({ message: "Ride updated successfully", ride });
  } catch (err) {
    console.error("UPDATE RIDE BY ADMIN ERROR:", err);
    res.status(500).json({ message: "Error updating ride" });
  }
};

// Delete ride by admin
const deleteRideByAdmin = async (req, res) => {
  try {
    await Ride.findByIdAndDelete(req.params.rideId);
    res.json({ message: "Ride deleted successfully" });
  } catch (err) {
    console.error("DELETE RIDE BY ADMIN ERROR:", err);
    res.status(500).json({ message: "Error deleting ride" });
  }
};

module.exports = {
  requestRide,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getDriverRides,
  getUserRides,
  getAllRides,
  getRideById,
  updateRideByAdmin,
  deleteRideByAdmin,
};
