
const mongoose = require('mongoose');
const User = require('./models/User');


const MONGO_URI = 'mongodb://localhost:27017/campus-event-management';


const emailToActivate = process.argv[2] || 'organizer@example.com';

async function activateUser() {
  await mongoose.connect(MONGO_URI);
  const user = await User.findOne({ email: emailToActivate });
  if (!user) {
    console.log('User not found! Here are all users:');
    const users = await User.find({}, 'email role isActive');
    users.forEach(u => console.log(`${u.email} | ${u.role} | active: ${u.isActive}`));
    process.exit(1);
  }
  user.isActive = true;
  await user.save();
  console.log(`User ${user.email} is now active!`);
  process.exit(0);
}

activateUser().catch(err => {
  console.error(err);
  process.exit(1);
});