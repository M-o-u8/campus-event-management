const mongoose = require('mongoose');

async function testMongoConnection() {
  try {
    console.log('🔍 Testing MongoDB Connection...\n');
    
    // Test connection
    console.log('1️⃣ Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/campus-events', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    
    // Test if we can perform basic operations
    console.log('\n2️⃣ Testing basic database operations...');
    
    // Try to create a simple collection and document
    const TestCollection = mongoose.connection.collection('test_connection');
    await TestCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Write operation successful');
    
    const result = await TestCollection.findOne({ test: true });
    console.log('✅ Read operation successful');
    
    await TestCollection.deleteOne({ test: true });
    console.log('✅ Delete operation successful');
    
    console.log('\n✨ MongoDB is working perfectly!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running. Please start MongoDB service.');
      console.log('   On Windows: Start MongoDB service or run mongod');
      console.log('   On macOS/Linux: brew services start mongodb-community');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 MongoDB authentication failed. Check username/password.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 MongoDB host not found. Check connection string.');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed.');
    }
  }
}

testMongoConnection();

