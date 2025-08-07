const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

async function createOrResetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const username = 'admin123';
    const plainPassword = 'admin123';

    const existing = await Admin.findOne({ username });
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (existing) {
      existing.password = hashedPassword;
      await existing.save();
      console.log(`🔁 Password reset for existing admin "${username}"`);
    } else {
      const newAdmin = new Admin({ username, password: hashedPassword });
      await newAdmin.save();
      console.log(`🎉 New admin created: ${username}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createOrResetAdmin();
