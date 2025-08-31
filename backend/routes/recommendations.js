const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');

// Get personalized event recommendations for user
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, category, date } = req.query;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Build query for events
    let query = { status: 'approved' };
    
    if (category) {
      query.category = category;
    }
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    }
    
    // Get all available events
    const events = await Event.find(query)
      .populate('organizer', 'name')
      .sort({ date: 1 });
    
    // Calculate recommendation scores for each event
    const scoredEvents = events.map(event => {
      const score = user.getRecommendationScore(event);
      return {
        event,
        score,
        reasons: getRecommendationReasons(event, user)
      };
    });
    
    // Sort by score and limit results
    const recommendations = scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map(item => ({
        event: item.event,
        score: item.score,
        reasons: item.reasons,
        matchPercentage: Math.min(100, Math.round((item.score / 50) * 100))
      }));
    
    res.json({
      recommendations,
      userPreferences: {
        interests: user.aiPreferences.interests,
        preferredCategories: user.aiPreferences.preferredCategories,
        preferredTimes: user.aiPreferences.preferredTimes,
        preferredVenues: user.aiPreferences.preferredVenues
      }
    });

  } catch (error) {
    console.error('Error getting event recommendations:', error);
    res.status(500).json({ message: 'Failed to get event recommendations' });
  }
});

// Update user AI preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { interests, categories, times, venues } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.updateAIPreferences(interests, categories, times, venues);
    
    res.json({
      message: 'AI preferences updated successfully',
      preferences: user.aiPreferences
    });

  } catch (error) {
    console.error('Error updating AI preferences:', error);
    res.status(500).json({ message: 'Failed to update AI preferences' });
  }
});

// Get user AI preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      preferences: user.aiPreferences
    });

  } catch (error) {
    console.error('Error getting AI preferences:', error);
    res.status(500).json({ message: 'Failed to get AI preferences' });
  }
});

// Get trending events (based on registrations and feedback)
router.get('/trending', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, timeframe = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Get events with high engagement
    const trendingEvents = await Event.aggregate([
      {
        $match: {
          status: 'approved',
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [{ $size: '$attendees' }, 2] }, // Registrations
              { $multiply: ['$totalRatings', 3] }, // Feedback
              { $cond: [{ $gt: ['$averageRating', 0] }, '$averageRating', 0] } // Rating bonus
            ]
          }
        }
      },
      {
        $sort: { engagementScore: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'organizer',
          foreignField: '_id',
          as: 'organizer'
        }
      },
      {
        $unwind: '$organizer'
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          category: 1,
          date: 1,
          time: 1,
          venue: 1,
          maxAttendees: 1,
          attendees: 1,
          averageRating: 1,
          totalRatings: 1,
          engagementScore: 1,
          'organizer.name': 1
        }
      }
    ]);
    
    res.json({
      trendingEvents,
      timeframe,
      totalEvents: trendingEvents.length
    });

  } catch (error) {
    console.error('Error getting trending events:', error);
    res.status(500).json({ message: 'Failed to get trending events' });
  }
});

// Get collaborative recommendations (events liked by similar users)
router.get('/collaborative', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's event history
    const userEvents = await Event.find({
      'attendees.user': user._id,
      status: 'approved'
    }).select('category tags');
    
    if (userEvents.length === 0) {
      return res.json({
        message: 'Not enough event history for collaborative recommendations',
        recommendations: []
      });
    }
    
    // Find users with similar interests
    const userCategories = userEvents.map(e => e.category);
    const userTags = userEvents.flatMap(e => e.tags || []);
    
    const similarUsers = await Event.aggregate([
      {
        $match: {
          'attendees.user': { $ne: user._id },
          category: { $in: userCategories },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$attendees.user',
          commonEvents: { $sum: 1 },
          categories: { $addToSet: '$category' },
          tags: { $addToSet: '$tags' }
        }
      },
      {
        $match: {
          commonEvents: { $gte: 2 } // At least 2 common events
        }
      },
      {
        $sort: { commonEvents: -1 }
      },
      {
        $limit: 20
      }
    ]);
    
    if (similarUsers.length === 0) {
      return res.json({
        message: 'No similar users found',
        recommendations: []
      });
    }
    
    // Get events liked by similar users
    const similarUserIds = similarUsers.map(u => u._id);
    
    const collaborativeEvents = await Event.aggregate([
      {
        $match: {
          'attendees.user': { $in: similarUserIds },
          'attendees.user': { $ne: user._id },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$_id',
          event: { $first: '$$ROOT' },
          similarUserCount: { $sum: 1 }
        }
      },
      {
        $sort: { similarUserCount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'event.organizer',
          foreignField: '_id',
          as: 'organizer'
        }
      },
      {
        $unwind: '$organizer'
      }
    ]);
    
    const recommendations = collaborativeEvents.map(item => ({
      event: {
        ...item.event,
        organizer: item.organizer
      },
      similarUserCount: item.similarUserCount,
      reason: `Liked by ${item.similarUserCount} users with similar interests`
    }));
    
    res.json({
      recommendations,
      similarUsersFound: similarUsers.length
    });

  } catch (error) {
    console.error('Error getting collaborative recommendations:', error);
    res.status(500).json({ message: 'Failed to get collaborative recommendations' });
  }
});

// Helper function to get recommendation reasons
function getRecommendationReasons(event, user) {
  const reasons = [];
  
  // Category preference
  if (user.aiPreferences.preferredCategories.includes(event.category)) {
    reasons.push(`Matches your preferred category: ${event.category}`);
  }
  
  // Time preference
  if (user.aiPreferences.preferredTimes.includes(event.time)) {
    reasons.push(`Matches your preferred time: ${event.time}`);
  }
  
  // Venue preference
  if (user.aiPreferences.preferredVenues.includes(event.venue)) {
    reasons.push(`Matches your preferred venue: ${event.venue}`);
  }
  
  // Interest matching
  const eventTags = event.tags || [];
  const matchingInterests = user.aiPreferences.interests.filter(interest => 
    eventTags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
  );
  
  if (matchingInterests.length > 0) {
    reasons.push(`Matches your interests: ${matchingInterests.join(', ')}`);
  }
  
  // High rating
  if (event.averageRating >= 4.0) {
    reasons.push('Highly rated by other users');
  }
  
  // Popular event
  if (event.attendees && event.attendees.length >= event.maxAttendees * 0.8) {
    reasons.push('Popular event - filling up fast');
  }
  
  return reasons;
}

module.exports = router;
