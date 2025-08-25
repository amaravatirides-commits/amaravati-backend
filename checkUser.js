require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function checkUser() {
  try {
    const email = "YOUR_EMAIL_HERE";       // same as in Postman
    const plainPassword = "YOUR_PASSWORD"; // same as in Postman

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("📄 Stored user document:", user);

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log("🔑 Password match result:", isMatch);

  } catch (err) {
    console.error("Error checking user:", err);
  } finally {
    mongoose.disconnect();
  }
}

checkUser();