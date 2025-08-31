const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/campus-events')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the user with mahiamemu@gmail.com
      const user = await User.findOne({ email: 'mahiamemu@gmail.com' });
      
      if (!user) {
        console.log('User not found with email: mahiamemu@gmail.com');
        process.exit(1);
      }
      
      console.log(`Found user: ${user.name} (${user.email})`);
      
      // Set a new simple password
      const newPassword = 'mahia123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      
      console.log(`Password reset successfully!`);
      console.log(`New login credentials:`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${newPassword}`);
      
      process.exit(0);
    } catch (error) {
      console.error('Error resetting password:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });




