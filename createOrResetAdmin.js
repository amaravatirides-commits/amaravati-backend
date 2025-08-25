// createOrResetAdmin.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/amaravati';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const username = 'admin123';
    const plainPassword = 'admin123';

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`✅ Password reset to "${plainPassword}" for ${username}`);
    } else {
      const newAdmin = new Admin({
        username,
        password: hashedPassword
      });
      await newAdmin.save();
      console.log(`✅ Admin created with username "${username}" and password "${plainPassword}"`);
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
  });