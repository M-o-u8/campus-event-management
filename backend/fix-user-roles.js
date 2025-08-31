const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-events')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const fixUserRoles = async () => {
  try {
    console.log('🔧 Fixing user roles to match requested configuration...');
    
    // Update Mahia Memu to have admin, organizer, and student roles
    const mahia = await User.findOne({ email: 'mahiamemu@gmail.com' });
    if (mahia) {
      mahia.roles = ['admin', 'organizer', 'student'];
      mahia.currentRole = 'admin';
      await mahia.save();
      console.log('✅ Updated Mahia Memu with roles: admin, organizer, student');
    } else {
      console.log('❌ Mahia Memu not found');
    }

    // Update Sajid Sarower to have admin and organizer roles
    const sajid = await User.findOne({ email: 'sajidsarower@gmail.com' });
    if (sajid) {
      sajid.roles = ['admin', 'organizer'];
      sajid.currentRole = 'organizer';
      await sajid.save();
      console.log('✅ Updated Sajid Sarower with roles: admin, organizer');
    } else {
      console.log('❌ Sajid Sarower not found');
    }

    // Update Ziar Mou to have student and organizer roles
    const ziar = await User.findOne({ email: 'ziaramou200308@gmail.com' });
    if (ziar) {
      ziar.roles = ['student', 'organizer'];
      ziar.currentRole = 'student';
      await ziar.save();
      console.log('✅ Updated Ziar Mou with roles: student, organizer');
    } else {
      console.log('❌ Ziar Mou not found');
    }

    // Verify the updates
    console.log('\n🔍 Verifying updated user roles:');
    const updatedUsers = await User.find({
      email: { 
        $in: [
          'mahiamemu@gmail.com',
          'sajidsarower@gmail.com', 
          'ziaramou200308@gmail.com'
        ]
      }
    });

    updatedUsers.forEach(user => {
      console.log(`👤 ${user.name} (${user.email}):`);
      console.log(`   Roles: [${user.roles.join(', ')}]`);
      console.log(`   Current Role: ${user.currentRole}`);
      console.log(`   Active: ${user.isActive}`);
      console.log('');
    });

    console.log('🎉 User roles updated successfully!');
    console.log('\n📋 Updated User Configuration:');
    console.log('• Mahia Memu: admin, organizer, student (current: admin)');
    console.log('• Sajid Sarower: admin, organizer (current: organizer)');
    console.log('• Ziar Mou: student, organizer (current: student)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    process.exit(1);
  }
};

fixUserRoles(); 