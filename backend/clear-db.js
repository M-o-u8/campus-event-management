const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-events')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const clearDatabase = async () => {
  try {
    console.log('Clearing database...');
    
    // Wait for connection to be ready
    await mongoose.connection.asPromise();
    
    // Clear all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (let collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }
    
    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
