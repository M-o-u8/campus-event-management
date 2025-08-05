const mongoose = require('mongoose');
const User = require('../models/User');

// Database reset utility for testing
const resetDatabase = async () => {
    try {
        console.log('🗑️ Starting database reset...');
        
        // Get the database connection
        const db = mongoose.connection.db;
        
        // Drop all indexes from users collection
        try {
            const indexes = await db.collection('users').indexes();
            console.log('📊 Current indexes:', indexes.map(idx => idx.name));
            
            for (const index of indexes) {
                if (index.name !== '_id_') { // Don't drop the _id index
                    await db.collection('users').dropIndex(index.name);
                    console.log(`✅ Dropped index: ${index.name}`);
                }
            }
        } catch (error) {
            console.log('ℹ️ No indexes to drop or error dropping indexes:', error.message);
        }
        
        // Delete all users
        const deleteResult = await User.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} users`);
        
        // Recreate proper indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        console.log('✅ Recreated email unique index');
        
        console.log('🎉 Database reset completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        return false;
    }
};

// Check database status
const checkDatabase = async () => {
    try {
        const userCount = await User.countDocuments({});
        console.log(`📊 Current users in database: ${userCount}`);
        
        if (userCount > 0) {
            const users = await User.find({}).select('name email role createdAt');
            console.log('👥 Users in database:');
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - ${user.role} - Created: ${user.createdAt}`);
            });
        }
        
        return userCount;
    } catch (error) {
        console.error('❌ Database check failed:', error);
        return 0;
    }
};

module.exports = { resetDatabase, checkDatabase }; 