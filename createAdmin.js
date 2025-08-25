// createAdmin.js
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

    const email = 'admin@example.com'; // Use email as unique identifier
    const plainPassword = 'admin123';

    const existing = await Admin.findOne({ email });
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (existing) {
      existing.password = hashedPassword;
      await existing.save();
      console.log(`🔁 Password reset for existing admin "${email}"`);
    } else {
      const newAdmin = new Admin({ email, password: hashedPassword });
      await newAdmin.save();
      console.log(`🎉 New admin created: ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createOrResetAdmin();