const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-events')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const registerUsers = async () => {
  try {
    console.log('Registering personal Gmail accounts...');
    
    // Check if users already exist
    const existingUsers = await User.find({
      email: { 
        $in: [
          'mahiamemu@gmail.com',
          'sajidsarower@gmail.com', 
          'ziaramou200308@gmail.com',
          'safin.ahamed.ifty@gmail.com'
        ]
      }
    });
    
    if (existingUsers.length > 0) {
      console.log('Some users already exist:');
      existingUsers.forEach(user => {
        console.log(`- ${user.email} (${user.roles.join(', ')})`);
      });
    }
    
    // Create users with appropriate roles
    const usersToCreate = [
      {
        name: 'Mahia Memu',
        email: 'mahiamemu@gmail.com',
        password: 'mahia123', // You can change this
        roles: ['admin', 'organizer', 'student'], // Multiple roles as requested
        currentRole: 'admin',
        isActive: true
      },
      {
        name: 'Sajid Sarower',
        email: 'sajidsarower@gmail.com',
        password: 'sajid123', // You can change this
        roles: ['admin', 'organizer'], // Multiple roles as requested
        currentRole: 'organizer',
        isActive: true
      },
      {
        name: 'Ziar Mou',
        email: 'ziaramou200308@gmail.com',
        password: 'ziar123', // You can change this
        roles: ['student', 'organizer'], // Multiple roles as requested
        currentRole: 'student',
        isActive: true
      },
      {
        name: 'Safin Ahamed Ifty',
        email: 'safin.ahamed.ifty@gmail.com',
        password: 'safin123', // You can change this
        roles: ['student'],
        currentRole: 'student',
        isActive: true
      }
    ];
    
    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }
      
      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.roles.join(', ')})`);
    }
    
    console.log('\n🎉 Personal accounts registration completed!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: mahiamemu@gmail.com / mahia123');
    console.log('Organizer: sajidsarower@gmail.com / sajid123');
    console.log('Student: ziaramou200308@gmail.com / ziar123');
    console.log('Student: safin.ahamed.ifty@gmail.com / safin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error registering users:', error);
    process.exit(1);
  }
};

registerUsers();

