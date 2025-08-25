const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const admins = await Admin.find();
    console.log('📋 Admin Users:', admins);

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });