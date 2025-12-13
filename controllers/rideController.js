// controllers/rideController.js
const Ride = require("../models/Ride");
const NodeGeocoder = require("node-geocoder");
const { getDistance } = require("geolib");

// Geocoder setup
const geocoder = NodeGeocoder({
  provider: "openstreetmap", // free, no API key needed
});

/* ================= USER ================= */

// Request a ride
const requestRide = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({ message: "Pickup and dropoff are required" });
    }

    // Geocode pickup and dropoff
    const [pickupCoords] = await geocoder.geocode(pickup);
    const [dropoffCoords] = await geocoder.geocode(dropoff);

    if (!pickupCoords || !dropoffCoords) {
      return res.status(400).json({ message: "Invalid pickup or dropoff location" });
    }

    const ride = await Ride.create({
      user: req.user._id,
      pickup,
      dropoff,
      pickupLat: pickupCoords.latitude,
      pickupLng: pickupCoords.longitude,
      dropoffLat: dropoffCoords.latitude,
      dropoffLng: dropoffCoords.longitude,
      status: "requested",
    });

    res.status(201).json({ message: "Ride requested successfully", ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error requesting ride" });
  }
};

/* ================= DRIVER ================= */

// Get available rides (ONLY VALID ONES)
const getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: "requested",
      user: { $ne: null },
      pickup: { $exists: true },
      dropoff: { $exists: true },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching available rides" });
  }
};

// Accept ride
const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (!ride.user || !ride.dropoff) return res.status(400).json({ message: "Invalid ride data" });
    if (ride.status !== "requested") return res.status(400).json({ message: "Ride already accepted" });

    ride.driver = req.user._id;
    ride.status = "accepted";

    // Use stored coordinates for distance/fare calculation
    if (ride.pickupLat && ride.pickupLng && ride.dropoffLat && ride.dropoffLng) {
      const distance = getDistance(
        { latitude: ride.pickupLat, longitude: ride.pickupLng },
        { latitude: ride.dropoffLat, longitude: ride.dropoffLng }
      );
      const distanceInKm = distance / 1000;
      const baseFare = 20;
      const farePerKm = 10;
      ride.fare = baseFare + Math.round(distanceInKm * farePerKm);
    }

    await ride.save();

    res.json({ message: "Ride accepted successfully", ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting ride" });
  }
};

// Update ride status
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["in-progress", "completed", "cancelled"];

    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid ride status" });

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = status;
    await ride.save();

    res.json({ message: "Ride status updated", ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
};

// Driver history
const getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id }).populate("user", "name email");
    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching driver rides" });
  }
};

// User history
const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id }).populate("driver", "name email");
    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user rides" });
  }
};

/* ================= ADMIN ================= */

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate("user", "name email").populate("driver", "name email");
    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching all rides" });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId).populate("user", "name email").populate("driver", "name email");
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.json(ride);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching ride" });
  }
};

const updateRideByAdmin = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.rideId, req.body, { new: true })
      .populate("user", "name email")
      .populate("driver", "name email");
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.json({ message: "Ride updated", ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating ride" });
  }
};

const deleteRideByAdmin = async (req, res) => {
  try {
    await Ride.findByIdAndDelete(req.params.rideId);
    res.json({ message: "Ride deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting ride" });
  }
};

module.exports = {
  requestRide,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getUserRides,
  getDriverRides,
  getAllRides,
  getRideById,
  updateRideByAdmin,
  deleteRideByAdmin,
};
