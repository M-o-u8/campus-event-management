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
      console.log(`Roles: ${user.roles.join(', ')}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Password hash: ${user.password.substring(0, 20)}...`);
      
      // Test password comparison
      const testPassword = 'mahia123';
      console.log(`\n🔐 Testing password: ${testPassword}`);
      
      const isValid = await user.comparePassword(testPassword);
      console.log(`Password valid: ${isValid}`);
      
      // Test with bcrypt directly
      const directCompare = await bcrypt.compare(testPassword, user.password);
      console.log(`Direct bcrypt compare: ${directCompare}`);
      
      // Test with wrong password
      const wrongPassword = 'wrongpassword';
      const isWrongValid = await user.comparePassword(wrongPassword);
      console.log(`Wrong password valid: ${isWrongValid}`);
      
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




