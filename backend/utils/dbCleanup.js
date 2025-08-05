const mongoose = require('mongoose');
const User = require('../models/User');

// Database cleanup utility to fix index issues
const cleanupDatabase = async () => {
    try {
        console.log('🧹 Starting database cleanup...');
        
        // Get the database connection
        const db = mongoose.connection.db;
        
        // Drop problematic indexes
        try {
            await db.collection('users').dropIndex('id_1');
            console.log('✅ Dropped problematic id_1 index');
        } catch (error) {
            console.log('ℹ️ id_1 index not found or already dropped');
        }
        
        try {
            await db.collection('users').dropIndex('id_-1');
            console.log('✅ Dropped problematic id_-1 index');
        } catch (error) {
            console.log('ℹ️ id_-1 index not found or already dropped');
        }
        
        // Remove any documents with null id field
        const result = await User.deleteMany({ id: null });
        console.log(`✅ Removed ${result.deletedCount} documents with null id`);
        
        // Remove any documents with undefined id field
        const result2 = await User.deleteMany({ id: { $exists: false } });
        console.log(`✅ Removed ${result2.deletedCount} documents with undefined id`);
        
        // Ensure proper indexes are created
        await User.collection.createIndex({ email: 1 }, { unique: true });
        console.log('✅ Recreated email unique index');
        
        console.log('🎉 Database cleanup completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Database cleanup failed:', error);
        return false;
    }
};

// Check for problematic data
const checkDatabaseHealth = async () => {
    try {
        console.log('🔍 Checking database health...');
        
        // Check for documents with null id
        const nullIdCount = await User.countDocuments({ id: null });
        console.log(`📊 Documents with null id: ${nullIdCount}`);
        
        // Check for documents with undefined id
        const undefinedIdCount = await User.countDocuments({ id: { $exists: false } });
        console.log(`📊 Documents with undefined id: ${undefinedIdCount}`);
        
        // Check total users
        const totalUsers = await User.countDocuments({});
        console.log(`📊 Total users: ${totalUsers}`);
        
        // List all indexes
        const indexes = await User.collection.indexes();
        console.log('📊 Current indexes:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        return {
            nullIdCount,
            undefinedIdCount,
            totalUsers,
            indexes: indexes.length
        };
    } catch (error) {
        console.error('❌ Database health check failed:', error);
        return null;
    }
};

module.exports = { cleanupDatabase, checkDatabaseHealth }; 