const mongoose = require('mongoose');
const User = require('./models/User');

async function testLoginExisting() {
  try {
    console.log('🔍 Testing Login with Existing User...\n');
    
    // Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/campus-events');
    console.log('✅ MongoDB connected');
    
    // Test 2: Find existing user
    console.log('\n2️⃣ Finding existing user...');
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (!existingUser) {
      console.log('❌ No existing user found');
      return;
    }
    
    console.log('✅ Existing user found');
    console.log('   Name:', existingUser.name);
    console.log('   Email:', existingUser.email);
    console.log('   Roles:', existingUser.roles);
    console.log('   Current Role:', existingUser.currentRole);
    console.log('   Password Hash:', existingUser.password.substring(0, 20) + '...');
    
    // Test 3: Test password comparison
    console.log('\n3️⃣ Testing password comparison...');
    const isPasswordValid = await existingUser.comparePassword('password123');
    console.log('✅ Password comparison successful');
    console.log('   Correct password valid:', isPasswordValid);
    
    const isWrongPasswordValid = await existingUser.comparePassword('wrongpassword');
    console.log('   Wrong password valid:', isWrongPasswordValid);
    
    // Test 4: Test role switching
    console.log('\n4️⃣ Testing role switching...');
    const roleSwitchResult = existingUser.switchRole('organizer');
    console.log('✅ Role switching successful');
    console.log('   Role switch result:', roleSwitchResult);
    console.log('   Current role:', existingUser.currentRole);
    
    // Save the updated user
    await existingUser.save();
    console.log('✅ Updated user saved');
    
    // Test 5: Test switching back
    console.log('\n5️⃣ Testing role switch back...');
    existingUser.switchRole('student');
    await existingUser.save();
    console.log('✅ Switched back to student role');
    
    console.log('\n✨ Login test with existing user complete!');
    console.log('\n🚀 You can now test login in the frontend with:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed.');
    }
  }
}

testLoginExisting();

