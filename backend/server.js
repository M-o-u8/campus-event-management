const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const resourceRoutes = require('./routes/resources');
const gamificationRoutes = require('./routes/gamification');
const recommendationRoutes = require('./routes/recommendations');

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-events')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Server will start without database connection');
  console.log('💡 Make sure MongoDB is running on your system');
});


app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/recommendations', recommendationRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Campus Event Management API' });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 