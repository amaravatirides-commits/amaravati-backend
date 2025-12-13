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
      default: null,
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
      enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    fare: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
module.exports = mongoose.models.Ride || mongoose.model('Ride', rideSchema);
