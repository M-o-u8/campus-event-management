const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event_reminder', 'event_update', 'registration_confirmation', 'waitlist_promotion', 'badge_earned', 'points_earned', 'expense_approval', 'live_update'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  readAt: Date,
  archivedAt: Date,
  // Event-related notifications
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  // Action-related data
  actionUrl: String,
  actionText: String,
  // Metadata for different notification types
  metadata: {
    eventTitle: String,
    eventDate: Date,
    eventTime: String,
    venue: String,
    points: Number,
    badgeName: String,
    expenseAmount: Number,
    expenseCategory: String
  },
  // Delivery channels
  channels: {
    email: { sent: { type: Boolean, default: false }, sentAt: Date },
    push: { sent: { type: Boolean, default: false }, sentAt: Date },
    sms: { sent: { type: Boolean, default: false }, sentAt: Date },
    inApp: { sent: { type: Boolean, default: true }, sentAt: Date }
  },
  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
notificationSchema.index({ user: 1, status: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Methods
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsArchived = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

notificationSchema.methods.markChannelSent = function(channel) {
  if (this.channels[channel]) {
    this.channels[channel].sent = true;
    this.channels[channel].sentAt = new Date();
  }
  return this.save();
};

// Static methods
notificationSchema.statics.createEventReminder = function(userId, eventId, eventData) {
  return new this({
    user: userId,
    title: 'Event Reminder',
    message: `Don't forget! Your event "${eventData.title}" is starting soon.`,
    type: 'event_reminder',
    priority: 'high',
    eventId: eventId,
    metadata: {
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time,
      venue: eventData.venue
    },
    scheduledFor: new Date(eventData.date.getTime() - 60 * 60 * 1000) // 1 hour before
  });
};

notificationSchema.statics.createRegistrationConfirmation = function(userId, eventId, eventData, isWaitlisted = false) {
  const message = isWaitlisted 
    ? `You've been added to the waitlist for "${eventData.title}". We'll notify you if a spot opens up!`
    : `You're successfully registered for "${eventData.title}"! See you there!`;
  
  return new this({
    user: userId,
    title: isWaitlisted ? 'Added to Waitlist' : 'Registration Confirmed',
    message: message,
    type: 'registration_confirmation',
    priority: 'normal',
    eventId: eventId,
    metadata: {
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time,
      venue: eventData.venue
    }
  });
};

notificationSchema.statics.createBadgeNotification = function(userId, badgeName, description) {
  return new this({
    user: userId,
    title: 'New Badge Earned! 🏆',
    message: `Congratulations! You've earned the "${badgeName}" badge: ${description}`,
    type: 'badge_earned',
    priority: 'normal',
    metadata: {
      badgeName: badgeName
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);

