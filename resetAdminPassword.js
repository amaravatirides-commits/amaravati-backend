const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

// Load .env variables
dotenv.config();

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const admin = await Admin.findOne({ username: 'admin123' });

    if (!admin) {
      console.log('❌ Admin not found.');
      return;
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin.password = hashedPassword;

    // Save the updated admin
    await admin.save();

    console.log('✅ Password reset to "admin123" for admin123');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    // Disconnect cleanly
    await mongoose.disconnect();
  }
}

resetAdminPassword();