// controllers/rideController.js
const Ride = require('../models/Ride');

// ================= User & Driver =================

// Request a ride (User)
const requestRide = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({ message: "Pickup and dropoff are required" });
    }

    const ride = new Ride({
      user: req.user._id,
      pickup,
      dropoff,
      status: "requested"
    });

    await ride.save();
    res.status(201).json({ message: "Ride requested successfully", ride });
  } catch (error) {
    console.error("Error in requestRide:", error);
    res.status(500).json({ message: "Error requesting ride", error: error.message });
  }
};

// Driver accepts ride
const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.status !== "requested") {
      return res.status(400).json({ message: "Ride already accepted or completed" });
    }

    ride.driver = req.user._id;
    ride.status = "accepted";
    await ride.save();

    res.json({ message: "Ride accepted successfully", ride });
  } catch (error) {
    console.error("Error in acceptRide:", error);
    res.status(500).json({ message: "Error accepting ride", error: error.message });
  }
};

// Update ride status (Driver)
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["accepted", "in-progress", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid ride status" });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = status;
    await ride.save();

    res.json({ message: "Ride status updated", ride });
  } catch (error) {
    console.error("Error in updateRideStatus:", error);
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

// User ride history
const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id }).populate("driver", "name email");
    res.json(rides);
  } catch (error) {
    console.error("Error in getUserRides:", error);
    res.status(500).json({ message: "Error fetching user rides", error: error.message });
  }
};

// Driver ride history
const getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id }).populate("user", "name email");
    res.json(rides);
  } catch (error) {
    console.error("Error in getDriverRides:", error);
    res.status(500).json({ message: "Error fetching driver rides", error: error.message });
  }
};

// ================= Admin =================

// Get all rides
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("user", "name email")
      .populate("driver", "name email");
    res.json(rides);
  } catch (error) {
    console.error("Error in getAllRides:", error);
    res.status(500).json({ message: "Error fetching rides", error: error.message });
  }
};

// Get ride by ID
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate("user", "name email")
      .populate("driver", "name email");

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    res.json(ride);
  } catch (error) {
    console.error("Error in getRideById:", error);
    res.status(500).json({ message: "Error fetching ride", error: error.message });
  }
};

// Update ride by admin
const updateRideByAdmin = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.rideId, req.body, { new: true })
      .populate("user", "name email")
      .populate("driver", "name email");

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    res.json({ message: "Ride updated successfully", ride });
  } catch (error) {
    console.error("Error in updateRideByAdmin:", error);
    res.status(500).json({ message: "Error updating ride", error: error.message });
  }
};

// Delete ride
const deleteRideByAdmin = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    res.json({ message: "Ride deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRideByAdmin:", error);
    res.status(500).json({ message: "Error deleting ride", error: error.message });
  }
};

module.exports = {
  requestRide,
  acceptRide,
  updateRideStatus,
  getUserRides,
  getDriverRides,
  getAllRides,
  getRideById,
  updateRideByAdmin,
  deleteRideByAdmin,
};
