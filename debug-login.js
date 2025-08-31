const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/campus-events', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function debugLogin() {
  try {
    console.log('🔍 Debugging Login Issues...\n');

    // Check if we have any users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ No users found! Creating a test user...');
      
      // Create a test user
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roles: ['student', 'organizer', 'admin'],
        currentRole: 'student'
      });

      await testUser.save();
      console.log('✅ Test user created successfully!');
      console.log(`   Email: test@example.com`);
      console.log(`   Password: password123`);
      console.log(`   Roles: ${testUser.roles.join(', ')}`);
    } else {
      // Show existing users
      const users = await User.find({}).select('name email roles currentRole');
      console.log('👥 Existing users:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Roles: ${user.roles.join(', ')} - Current: ${user.currentRole}`);
      });
    }

    // Test password hashing
    console.log('\n🔐 Testing password functionality...');
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (testUser) {
      console.log(`   User found: ${testUser.name}`);
      console.log(`   Stored password hash: ${testUser.password.substring(0, 20)}...`);
      
      // Test password comparison
      const testPassword = 'password123';
      const isPasswordValid = await testUser.comparePassword(testPassword);
      console.log(`   Password '${testPassword}' valid: ${isPasswordValid}`);
      
      // Test wrong password
      const wrongPassword = 'wrongpassword';
      const isWrongPasswordValid = await testUser.comparePassword(wrongPassword);
      console.log(`   Password '${wrongPassword}' valid: ${isWrongPasswordValid}`);
    }

    // Test database connection
    console.log('\n🗄️ Testing database connection...');
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`   Database state: ${dbStates[dbState]} (${dbState})`);

    console.log('\n✨ Debug complete!');
    
    if (userCount === 0) {
      console.log('\n🚀 You can now test login with:');
      console.log('   Email: test@example.com');
      console.log('   Password: password123');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugLogin();

