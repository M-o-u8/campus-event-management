const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'social', 'sports', 'cultural', 'technical', 'workshop', 'other']
  },
  tags: [String],
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in hours
    default: 2
  },
  venue: {
    type: String,
    required: true
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentAmount: {
      type: Number,
      default: 0
    },
    ticketId: {
      type: String,
      unique: true,
      sparse: true
    },
    ticketType: {
      type: String,
      enum: ['regular', 'vip', 'student', 'early_bird'],
      default: 'regular'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  }],
  isPaid: {
    type: Boolean,
    default: false
  },
  ticketPricing: [{
    type: {
      type: String,
      enum: ['regular', 'vip', 'student', 'early_bird'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    available: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      default: 0
    }
  }],
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date,
    daysOfWeek: [{
      type: Number, // 0-6 (Sunday-Saturday)
      min: 0,
      max: 6
    }]
  },
  resources: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    cost: {
      type: Number,
      default: 0
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'in-use'],
      default: 'available'
    }
  }],
  venueAvailability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    conflicts: [{
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      },
      reason: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  availabilityReason: {
    type: String,
    enum: ['available', 'sold_out', 'cancelled', 'maintenance', 'weather', 'other'],
    default: 'available'
  },
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    },
    helpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notHelpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  notifications: [{
    type: {
      type: String,
      enum: ['reminder', 'update', 'cancellation', 'reminder'],
      required: true
    },
    message: String,
    sentTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Admin management fields
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  approvalNotes: {
    type: String,
    trim: true
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Media support
  media: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    filename: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Budget and expense tracking
  budget: {
    totalBudget: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    categories: [{
      name: {
        type: String,
        required: true
      },
      allocated: {
        type: Number,
        default: 0,
        min: 0
      },
      spent: {
        type: Number,
        default: 0,
        min: 0
      }
    }]
  },
  expenses: [{
    category: {
      type: String,
      required: true,
      enum: ['food', 'decorations', 'printing', 'equipment', 'venue', 'marketing', 'other']
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    receipt: {
      url: String,
      publicId: String
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Live updates and announcements
  liveUpdates: [{
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'urgent', 'update'],
      default: 'info'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    postedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Certificates for attendees
  certificates: [{
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'generated', 'downloaded'],
      default: 'pending'
    },
    generatedAt: Date,
    downloadUrl: String,
    certificateId: String
  }]
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.attendees.length >= this.maxAttendees;
};

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.attendees.some(attendee => 
    attendee.user.toString() === userId.toString()
  );
};

// Method to register user for event
eventSchema.methods.registerUser = function(userId, paymentAmount = 0) {
  if (this.isFull()) {
    throw new Error('Event is full');
  }
  
  if (this.isUserRegistered(userId)) {
    throw new Error('User already registered');
  }
  
  const attendee = {
    user: userId,
    paymentAmount: this.isPaid ? paymentAmount : 0,
    paymentStatus: this.isPaid ? 'pending' : 'completed'
  };
  
  this.attendees.push(attendee);
  return attendee;
};

// Method to unregister user from event
eventSchema.methods.unregisterUser = function(userId) {
  const index = this.attendees.findIndex(attendee => 
    attendee.user.toString() === userId.toString()
  );
  
  if (index === -1) {
    throw new Error('User not registered for this event');
  }
  
  this.attendees.splice(index, 1);
  return true;
};

// Method to add feedback
eventSchema.methods.addFeedback = function(userId, rating, review = '') {
  // Check if user has already given feedback
  const existingFeedback = this.feedback.find(f => 
    f.user.toString() === userId.toString()
  );
  
  if (existingFeedback) {
    throw new Error('User has already given feedback for this event');
  }
  
  const feedback = {
    user: userId,
    rating,
    review
  };
  
  this.feedback.push(feedback);
  
  // Update average rating
  this.updateAverageRating();
  
  return feedback;
};

// Method to update existing feedback
eventSchema.methods.updateFeedback = function(userId, rating, review = '') {
  const existingFeedback = this.feedback.find(f => 
    f.user.toString() === userId.toString()
  );
  
  if (!existingFeedback) {
    throw new Error('User has not given feedback for this event');
  }
  
  existingFeedback.rating = rating;
  existingFeedback.review = review;
  existingFeedback.updatedAt = new Date();
  
  // Update average rating
  this.updateAverageRating();
  
  return existingFeedback;
};

// Method to update average rating
eventSchema.methods.updateAverageRating = function() {
  if (this.feedback.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }
  
  const totalRating = this.feedback.reduce((sum, f) => sum + f.rating, 0);
  this.averageRating = totalRating / this.feedback.length;
  this.totalRatings = this.feedback.length;
};

// Budget and expense management methods
eventSchema.methods.setBudget = function(totalBudget, currency = 'USD', categories = []) {
  this.budget.totalBudget = totalBudget;
  this.budget.currency = currency;
  
  if (categories.length > 0) {
    this.budget.categories = categories.map(cat => ({
      name: cat.name,
      allocated: cat.allocated || 0,
      spent: 0
    }));
  }
  
  return this.budget;
};

eventSchema.methods.addExpense = function(category, description, amount, currency = 'USD', receipt = null, addedBy) {
  const expense = {
    category,
    description,
    amount,
    currency,
    receipt,
    addedBy,
    addedAt: new Date(),
    status: 'pending'
  };
  
  this.expenses.push(expense);
  
  // Update category spent amount
  const budgetCategory = this.budget.categories.find(cat => cat.name === category);
  if (budgetCategory) {
    budgetCategory.spent += amount;
  }
  
  return expense;
};

eventSchema.methods.approveExpense = function(expenseId, approvedBy) {
  const expense = this.expenses.id(expenseId);
  if (!expense) {
    throw new Error('Expense not found');
  }
  
  expense.status = 'approved';
  expense.approvedBy = approvedBy;
  expense.approvedAt = new Date();
  
  return expense;
};

eventSchema.methods.getBudgetSummary = function() {
  const totalSpent = this.expenses
    .filter(exp => exp.status === 'approved')
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalPending = this.expenses
    .filter(exp => exp.status === 'pending')
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const remaining = this.budget.totalBudget - totalSpent;
  
  return {
    totalBudget: this.budget.totalBudget,
    totalSpent,
    totalPending,
    remaining,
    currency: this.budget.currency,
    categories: this.budget.categories.map(cat => ({
      ...cat,
      remaining: cat.allocated - cat.spent
    }))
  };
};

// Live updates methods
eventSchema.methods.addLiveUpdate = function(message, type = 'info', postedBy) {
  const update = {
    message,
    type,
    postedBy,
    postedAt: new Date(),
    isActive: true
  };
  
  this.liveUpdates.push(update);
  return update;
};

// Certificate generation methods
eventSchema.methods.generateCertificate = function(attendeeId) {
  const attendee = this.attendees.find(a => a.user.toString() === attendeeId.toString());
  if (!attendee) {
    throw new Error('Attendee not found');
  }
  
  // Check if certificate already exists
  const existingCertificate = this.certificates.find(c => c.attendee.toString() === attendeeId.toString());
  if (existingCertificate) {
    return existingCertificate;
  }
  
  const certificate = {
    attendee: attendeeId,
    status: 'generated',
    generatedAt: new Date(),
    certificateId: `CERT-${this._id.toString().slice(-6)}-${attendeeId.toString().slice(-6)}-${Date.now()}`
  };
  
  this.certificates.push(certificate);
  return certificate;
};

// Method to check venue availability
eventSchema.methods.checkVenueAvailability = async function() {
  try {
    // Check if required fields exist
    if (!this.venue || !this.date) {
      console.log('⚠️ Event missing venue or date for availability check');
      return true; // Assume available if we can't check
    }

    const Event = this.constructor;
    const conflictingEvents = await Event.find({
      _id: { $ne: this._id },
      venue: this.venue,
      date: this.date,
      status: { $in: ['pending', 'approved'] }
    });
    
    // Initialize venueAvailability if it doesn't exist
    if (!this.venueAvailability) {
      this.venueAvailability = {
        isAvailable: true,
        conflicts: []
      };
    }
    
    this.venueAvailability.conflicts = conflictingEvents.map(event => ({
      eventId: event._id,
      reason: 'Venue conflict on same date'
    }));
    
    this.venueAvailability.isAvailable = conflictingEvents.length === 0;
    return this.venueAvailability.isAvailable;
  } catch (error) {
    console.error('Error checking venue availability:', error);
    // Return true (available) if there's an error, so the process can continue
    return true;
  }
};

// Method to get event statistics
eventSchema.methods.getStats = function() {
  const totalRegistrations = this.attendees.length;
  const confirmedRegistrations = this.attendees.filter(a => a.status === 'registered').length;
  const attendedCount = this.attendees.filter(a => a.status === 'attended').length;
  const cancelledCount = this.attendees.filter(a => a.status === 'cancelled').length;
  
  return {
    totalRegistrations,
    confirmedRegistrations,
    attendedCount,
    cancelledCount,
    attendanceRate: totalRegistrations > 0 ? (attendedCount / totalRegistrations) * 100 : 0,
    cancellationRate: totalRegistrations > 0 ? (cancelledCount / totalRegistrations) * 100 : 0
  };
};

// Method to send notifications to attendees
eventSchema.methods.notifyAttendees = async function(notificationType, message) {
  const Notification = require('./Notification');
  
  const notifications = this.attendees.map(attendee => ({
    title: `Event Update: ${this.title}`,
    message: message,
    type: notificationType,
    recipients: [attendee.user],
    eventId: this._id,
    priority: 'normal'
  }));
  
  // Create notifications in batch
  await Notification.insertMany(notifications);
  return notifications.length;
};

// Method to check if event can be cancelled
eventSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
  
  // Can cancel if more than 24 hours before event
  return hoursUntilEvent > 24;
};

// Method to cancel event
eventSchema.methods.cancelEvent = async function(reason = 'Event cancelled by organizer') {
  if (!this.canBeCancelled()) {
    throw new Error('Event cannot be cancelled less than 24 hours before start time');
  }
  
  this.status = 'cancelled';
  this.availabilityReason = 'cancelled';
  this.isAvailable = false;
  
  // Notify all attendees
  await this.notifyAttendees('event_update', `Event "${this.title}" has been cancelled. Reason: ${reason}`);
  
  return this.save();
};

// Method to approve event (admin only)
eventSchema.methods.approveEvent = async function(adminId, notes = '') {
  this.status = 'approved';
  this.isAvailable = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.approvalNotes = notes;
  
  // Notify organizer
  await this.notifyOrganizer('event_update', `Your event "${this.title}" has been approved!`);
  
  return this.save();
};

// Method to reject event (admin only)
eventSchema.methods.rejectEvent = async function(adminId, reason = 'Event rejected by admin') {
  this.status = 'rejected';
  this.isAvailable = false;
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  
  // Notify organizer
  await this.notifyOrganizer('event_update', `Your event "${this.title}" has been rejected. Reason: ${reason}`);
  
  return this.save();
};

// Method to notify organizer
eventSchema.methods.notifyOrganizer = async function(notificationType, message) {
  try {
    // Check if required fields exist
    if (!this.organizer || !this.title) {
      console.log('⚠️ Event missing organizer or title for notification');
      return null;
    }

    const Notification = require('./Notification');
    
    const notification = new Notification({
      title: `Event Update: ${this.title}`,
      message: message,
      type: notificationType,
      recipients: [this.organizer],
      eventId: this._id,
      priority: 'normal'
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error sending organizer notification:', error);
    // Return null if there's an error, so the process can continue
    return null;
  }
};

// Method to update event details
eventSchema.methods.updateEvent = function(updateData) {
  const allowedFields = [
    'title', 'description', 'category', 'tags', 'date', 'time', 
    'duration', 'venue', 'maxAttendees', 'isPaid', 'price', 
    'currency', 'isRecurring', 'recurrence', 'resources'
  ];
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      this[field] = updateData[field];
    }
  });
  
  this.updatedAt = new Date();
  return this.save();
};

// Method to check if event can be edited
eventSchema.methods.canBeEdited = function() {
  return this.status === 'draft' || this.status === 'pending';
};

// Method to check if event can be deleted
eventSchema.methods.canBeDeleted = function() {
  return this.status === 'draft' || 
         (this.status === 'pending' && this.attendees.length === 0);
};

// Method to get event summary
eventSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    date: this.date,
    time: this.time,
    venue: this.venue,
    status: this.status,
    organizer: this.organizer,
    attendeeCount: this.attendees.length,
    maxAttendees: this.maxAttendees,
    category: this.category,
    isPaid: this.isPaid,
    averageRating: this.averageRating || 0
  };
};

// Method to get event details for admin
eventSchema.methods.getAdminDetails = function() {
  return {
    ...this.getSummary(),
    description: this.description,
    tags: this.tags,
    duration: this.duration,
    isRecurring: this.isRecurring,
    recurrence: this.recurrence,
    resources: this.resources,
    feedback: this.feedback,
    venueAvailability: this.venueAvailability,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Event', eventSchema);