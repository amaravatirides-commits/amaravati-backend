// controllers/rideController.js
const Ride = require('../models/Ride');

// ================= User & Driver =================

// Request a ride
const requestRide = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;
    const ride = new Ride({
      user: req.user._id,
      pickup,
      dropoff,
    });
    await ride.save();
    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting ride', error: error.message });
  }
};

// Driver accepts ride
const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    ride.driver = req.user._id;
    ride.status = 'accepted';
    await ride.save();

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting ride', error: error.message });
  }
};

// Update ride status
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    ride.status = status;
    await ride.save();

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

// User ride history
const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id }).populate('driver');
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user rides', error: error.message });
  }
};

// Driver ride history
const getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id }).populate('user');
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver rides', error: error.message });
  }
};

// ================= Admin =================

// Get all rides
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate('user').populate('driver');
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rides', error: error.message });
  }
};

// Get ride by ID
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId).populate('user').populate('driver');
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ride', error: error.message });
  }
};

// Update ride by admin
const updateRideByAdmin = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.rideId, req.body, { new: true });
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ride', error: error.message });
  }
};

// Delete ride
const deleteRideByAdmin = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    res.json({ message: 'Ride deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ride', error: error.message });
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
