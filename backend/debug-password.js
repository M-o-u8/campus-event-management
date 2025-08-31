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
      
      // Test with a simple password
      const testPassword = 'mahia123';
      console.log(`\n🔐 Testing password: ${testPassword}`);
      
      // Test 1: Direct bcrypt compare
      console.log('\n--- Test 1: Direct bcrypt compare ---');
      const directResult = await bcrypt.compare(testPassword, user.password);
      console.log(`bcrypt.compare("${testPassword}", hash): ${directResult}`);
      
      // Test 2: User model comparePassword method
      console.log('\n--- Test 2: User model comparePassword ---');
      const modelResult = await user.comparePassword(testPassword);
      console.log(`user.comparePassword("${testPassword}"): ${modelResult}`);
      
      // Test 3: Create a new hash and compare
      console.log('\n--- Test 3: Create new hash and compare ---');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log(`New hash for "${testPassword}": ${newHash}`);
      
      const newHashCompare = await bcrypt.compare(testPassword, newHash);
      console.log(`bcrypt.compare("${testPassword}", newHash): ${newHashCompare}`);
      
      // Test 4: Check if the user's password field is corrupted
      console.log('\n--- Test 4: Check password field ---');
      console.log(`Password field type: ${typeof user.password}`);
      console.log(`Password field length: ${user.password.length}`);
      console.log(`Password field starts with $2b$: ${user.password.startsWith('$2b$')}`);
      
      // Test 5: Try to update and test again
      console.log('\n--- Test 5: Update password and test ---');
      user.password = newHash;
      await user.save();
      console.log('Password updated to new hash');
      
      const finalTest = await user.comparePassword(testPassword);
      console.log(`Final test with new hash: ${finalTest}`);
      
      if (finalTest) {
        console.log('\n🎉 SUCCESS! Password is now working!');
        console.log(`\n📝 Login credentials:`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${testPassword}`);
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




