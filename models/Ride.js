// models/Ride.js
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    pickup: {
      type: String,
      required: true,
    },
    dropoff: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'ongoing', 'completed', 'cancelled'],
      default: 'requested',
    },
    fare: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Fix OverwriteModelError
const Ride = mongoose.models.Ride || mongoose.model('Ride', rideSchema);

module.exports = Ride;
