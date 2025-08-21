// models/Driver.js
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError on multiple imports / hot reload
const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

module.exports = Driver;
