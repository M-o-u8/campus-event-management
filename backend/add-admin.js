
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');


const email = 'admin@example.com';
const password = 'admin123';
const name = 'Admin User';

const MONGO_URI = 'mongodb://localhost:27017/campus-event-management';

async function addAdmin() {
  await mongoose.connect(MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists!');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });
  await user.save();
  console.log(`Admin user ${email} created and active!`);
  process.exit(0);
}

addAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});