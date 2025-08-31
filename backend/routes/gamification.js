const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// Get user's gamification profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      gamification: user.gamification,
      stats: user.gamification.stats,
      badges: user.gamification.badges,
      achievements: user.gamification.achievements
    });

  } catch (error) {
    console.error('Error getting gamification profile:', error);
    res.status(500).json({ message: 'Failed to get gamification profile' });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const { type = 'points', limit = 20 } = req.query;
    
    let sortField = 'gamification.points';
    if (type === 'level') sortField = 'gamification.level';
    if (type === 'badges') sortField = 'gamification.badges';
    if (type === 'events') sortField = 'gamification.stats.eventsAttended';
    
    const users = await User.find({ isActive: true })
      .select('name gamification.points gamification.level gamification.badges gamification.stats')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      points: user.gamification.points,
      level: user.gamification.level,
      badges: user.gamification.badges.length,
      eventsAttended: user.gamification.stats.eventsAttended,
      eventsOrganized: user.gamification.stats.eventsOrganized
    }));

    res.json({ leaderboard, type });

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
});

// Award points to user (admin/organizer only)
router.post('/award-points', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, points, reason, eventId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.addPoints(points, reason);
    
    // Create notification
    const notification = new Notification({
      user: userId,
      title: 'Points Awarded! 🎉',
      message: `You've earned ${points} points: ${reason}`,
      type: 'points_earned',
      priority: 'normal',
      eventId: eventId,
      metadata: { points: points }
    });
    await notification.save();

    res.json({
      message: 'Points awarded successfully',
      newTotal: user.gamification.points,
      newLevel: user.gamification.level
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ message: 'Failed to award points' });
  }
});

// Award badge to user (admin/organizer only)
router.post('/award-badge', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, badgeName, description, category, icon } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const badge = await user.addBadge(badgeName, description, category, icon);
    
    // Create notification
    const notification = Notification.createBadgeNotification(userId, badgeName, description);
    await notification.save();

    res.json({
      message: 'Badge awarded successfully',
      badge: badge
    });

  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ message: 'Failed to award badge' });
  }
});

// Update user stats (called automatically when events occur)
router.post('/update-stats', authenticateToken, async (req, res) => {
  try {
    const { statType, value, eventId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.updateStats(statType, value);
    
    // Check for automatic badges
    const stats = user.gamification.stats;
    
    // Event attendance badges
    if (statType === 'eventsAttended') {
      if (stats.eventsAttended === 5) {
        await user.addBadge('Event Enthusiast', 'Attended 5 events', 'attendance', '🎯');
      }
      if (stats.eventsAttended === 10) {
        await user.addBadge('Event Master', 'Attended 10 events', 'attendance', '👑');
      }
      if (stats.eventsAttended === 25) {
        await user.addBadge('Event Legend', 'Attended 25 events', 'attendance', '🌟');
      }
    }
    
    // Organization badges
    if (statType === 'eventsOrganized') {
      if (stats.eventsOrganized === 3) {
        await user.addBadge('Event Organizer', 'Organized 3 events', 'organization', '📋');
      }
      if (stats.eventsOrganized === 10) {
        await user.addBadge('Event Director', 'Organized 10 events', 'organization', '🎬');
      }
    }
    
    // Feedback badges
    if (statType === 'feedbackGiven') {
      if (stats.feedbackGiven === 5) {
        await user.addBadge('Feedback Champion', 'Gave 5 feedbacks', 'feedback', '💬');
      }
    }

    res.json({
      message: 'Stats updated successfully',
      stats: user.gamification.stats,
      badges: user.gamification.badges
    });

  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ message: 'Failed to update stats' });
  }
});

// Get available badges
router.get('/badges', authenticateToken, async (req, res) => {
  try {
    const badges = [
      {
        name: 'Event Enthusiast',
        description: 'Attended 5 events',
        category: 'attendance',
        icon: '🎯',
        requirement: 'Attend 5 events'
      },
      {
        name: 'Event Master',
        description: 'Attended 10 events',
        category: 'attendance',
        icon: '👑',
        requirement: 'Attend 10 events'
      },
      {
        name: 'Event Legend',
        description: 'Attended 25 events',
        category: 'attendance',
        icon: '🌟',
        requirement: 'Attend 25 events'
      },
      {
        name: 'Event Organizer',
        description: 'Organized 3 events',
        category: 'organization',
        icon: '📋',
        requirement: 'Organize 3 events'
      },
      {
        name: 'Event Director',
        description: 'Organized 10 events',
        category: 'organization',
        icon: '🎬',
        requirement: 'Organize 10 events'
      },
      {
        name: 'Feedback Champion',
        description: 'Gave 5 feedbacks',
        category: 'feedback',
        icon: '💬',
        requirement: 'Give 5 feedbacks'
      }
    ];

    res.json({ badges });

  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({ message: 'Failed to get badges' });
  }
});

module.exports = router;

