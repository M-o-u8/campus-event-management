const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Event = require('../models/Event');

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'unread', limit = 50, page = 1 } = req.query;
    
    const query = { user: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('eventId', 'title date time venue');
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await notification.markAsRead();
    
    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark notification as archived
router.put('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await notification.markAsArchived();
    
    res.json({ message: 'Notification archived' });

  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({ message: 'Failed to archive notification' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, status: 'unread' },
      { status: 'read', readAt: new Date() }
    );
    
    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Get notification count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      status: 'unread'
    });
    
    const totalCount = await Notification.countDocuments({
      user: req.user._id
    });
    
    res.json({
      unread: unreadCount,
      total: totalCount
    });

  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({ message: 'Failed to get notification count' });
  }
});

// Create event reminder notification (admin/organizer only)
router.post('/event-reminder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { eventId, userIds } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = Notification.createEventReminder(userId, eventId, {
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue
      });
      notifications.push(notification);
    }
    
    await Notification.insertMany(notifications);
    
    res.json({
      message: 'Event reminder notifications created',
      count: notifications.length
    });

  } catch (error) {
    console.error('Error creating event reminder notifications:', error);
    res.status(500).json({ message: 'Failed to create event reminder notifications' });
  }
});

// Create registration confirmation notification
router.post('/registration-confirmation', authenticateToken, async (req, res) => {
  try {
    const { eventId, isWaitlisted = false } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const notification = Notification.createRegistrationConfirmation(
      req.user._id,
      eventId,
      {
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue
      },
      isWaitlisted
    );
    
    await notification.save();
    
    res.json({
      message: 'Registration confirmation notification created',
      notification
    });

  } catch (error) {
    console.error('Error creating registration confirmation notification:', error);
    res.status(500).json({ message: 'Failed to create registration confirmation notification' });
  }
});

// Update user notification preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { email, push, sms, inApp, eventReminders, updates, promotions } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.notificationPreferences = {
      email: email !== undefined ? email : user.notificationPreferences.email,
      push: push !== undefined ? push : user.notificationPreferences.push,
      sms: sms !== undefined ? sms : user.notificationPreferences.sms,
      inApp: inApp !== undefined ? inApp : user.notificationPreferences.inApp,
      eventReminders: eventReminders !== undefined ? eventReminders : user.notificationPreferences.eventReminders,
      updates: updates !== undefined ? updates : user.notificationPreferences.updates,
      promotions: promotions !== undefined ? promotions : user.notificationPreferences.promotions
    };
    
    await user.save();
    
    res.json({
      message: 'Notification preferences updated',
      preferences: user.notificationPreferences
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
});

// Get user notification preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      preferences: user.notificationPreferences
    });

  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ message: 'Failed to get notification preferences' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await notification.deleteOne();
    
    res.json({ message: 'Notification deleted' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Admin: Get all notifications (admin only)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, type, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name email')
      .populate('eventId', 'title date time venue');
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting admin notifications:', error);
    res.status(500).json({ message: 'Failed to get admin notifications' });
  }
});

// Admin: Get notification statistics overview (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ status: 'unread' });
    const readNotifications = await Notification.countDocuments({ status: 'read' });
    const archivedNotifications = await Notification.countDocuments({ status: 'archived' });
    
    // Notifications by type
    const notificationsByType = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recent notifications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentNotifications = await Notification.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      totalNotifications,
      unreadNotifications,
      readNotifications,
      archivedNotifications,
      notificationsByType,
      recentNotifications
    });

  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({ message: 'Failed to get notification statistics' });
  }
});

module.exports = router;

