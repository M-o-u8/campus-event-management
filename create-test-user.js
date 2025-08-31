const mongoose = require('mongoose');
const User = require('./backend/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/campus-events')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'mahiamemu@gmail.com' });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      console.log('Current password should work for login');
      return;
    }

    // Create new test user
    const testUser = new User({
      name: 'Test User',
      email: 'mahiamemu@gmail.com',
      password: 'test123', // This will be hashed automatically by the User model
      roles: ['student', 'organizer'],
      currentRole: 'student',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: mahiamemu@gmail.com');
    console.log('Password: test123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
