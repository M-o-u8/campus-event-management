const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/campus-events')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the user
      const user = await User.findOne({ email: 'mahiamemu@gmail.com' });
      
      if (!user) {
        console.log('❌ User not found');
        process.exit(1);
      }
      
      console.log(`✅ User found: ${user.name} (${user.email})`);
      console.log(`Current password hash: ${user.password}`);
      
      // Create a new password and hash it
      const newPassword = 'mahia123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      console.log(`\n🔐 Setting new password: ${newPassword}`);
      console.log(`New hash: ${hashedPassword}`);
      
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Password updated successfully!');
      
      // Test the new password
      const isValid = await user.comparePassword(newPassword);
      console.log(`\n🧪 Testing new password: ${isValid}`);
      
      if (isValid) {
        console.log('🎉 SUCCESS! New password works!');
        console.log(`\n📝 Login credentials:`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${newPassword}`);
      } else {
        console.log('❌ FAILED! Password still not working');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });




