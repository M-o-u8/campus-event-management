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
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      console.log(`\n🔐 Setting new password: ${newPassword}`);
      console.log(`New hash: ${hashedPassword}`);
      
      // Use updateOne to bypass the pre-save middleware
      const result = await User.updateOne(
        { email: 'mahiamemu@gmail.com' },
        { $set: { password: hashedPassword } }
      );
      
      console.log(`✅ Password updated: ${result.modifiedCount} document(s) modified`);
      
      // Fetch the user again to test
      const updatedUser = await User.findOne({ email: 'mahiamemu@gmail.com' });
      console.log(`\n🧪 Testing new password...`);
      
      const isValid = await updatedUser.comparePassword(newPassword);
      console.log(`Password test result: ${isValid}`);
      
      if (isValid) {
        console.log('\n🎉 SUCCESS! Password is now working!');
        console.log(`\n📝 Login credentials:`);
        console.log(`Email: ${updatedUser.email}`);
        console.log(`Password: ${newPassword}`);
        console.log('\n🚀 You can now log in successfully!');
      } else {
        console.log('\n❌ FAILED! Password still not working');
        console.log('This suggests a deeper issue with the User model');
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




