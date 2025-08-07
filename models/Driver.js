const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: false,
  },
  vehicleType: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String, // URL or base64 string (optional)
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true, // Used for soft delete/deactivation
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
}, { timestamps: true });

// 🔄 Enable geospatial index
DriverSchema.index({ location: '2dsphere' });

// 🔐 Hash password before saving
DriverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Method to compare password
DriverSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Driver', DriverSchema);
