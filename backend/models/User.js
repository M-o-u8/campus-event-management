const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  roles: {
    type: [String],
    enum: ['student', 'organizer', 'admin'],
    default: ['student']
  },
  currentRole: {
    type: String,
    enum: ['student', 'organizer', 'admin'],
    default: 'student'
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    year: {
      type: Number,
      default: null
    },
    interests: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'colorful'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Gamification system
  gamification: {
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    badges: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      },
      category: {
        type: String,
        enum: ['attendance', 'feedback', 'organization', 'participation', 'special'],
        required: true
      }
    }],
    achievements: [{
      name: String,
      description: String,
      points: Number,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    stats: {
      eventsAttended: { type: Number, default: 0 },
      eventsOrganized: { type: Number, default: 0 },
      feedbackGiven: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 }
    }
  },
  // Notification preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    eventReminders: { type: Boolean, default: true },
    updates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false }
  },
  // AI recommendation preferences
  aiPreferences: {
    interests: [String],
    preferredCategories: [String],
    preferredTimes: [String],
    preferredVenues: [String],
    lastRecommendationUpdate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to switch roles
userSchema.methods.switchRole = function(newRole) {
  if (this.roles.includes(newRole)) {
    this.currentRole = newRole;
    return true;
  }
  return false;
};

// Method to add role
userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
    return true;
  }
  return false;
};

// Method to remove role
userSchema.methods.removeRole = function(role) {
  const index = this.roles.indexOf(role);
  if (index > -1) {
    this.roles.splice(index, 1);
    if (this.currentRole === role) {
      this.currentRole = this.roles[0] || 'student';
    }
    return true;
  }
  return false;
};

// Method to get user statistics
userSchema.methods.getStats = function() {
  return {
    totalEvents: this.events?.length || 0,
    totalRegistrations: this.registrations?.length || 0,
    walletBalance: this.wallet.balance,
    totalTransactions: this.wallet.transactions.length,
    accountAge: Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24)) // days
  };
};

// Method to add money to wallet
userSchema.methods.addMoney = function(amount, description = 'Credit added') {
  this.wallet.balance += amount;
  this.wallet.transactions.push({
    type: 'credit',
    amount,
    description,
    date: new Date()
  });
  return this.save();
};

// Method to deduct money from wallet
userSchema.methods.deductMoney = function(amount, description = 'Payment') {
  if (this.wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.wallet.balance -= amount;
  this.wallet.transactions.push({
    type: 'debit',
    amount,
    description,
    date: new Date()
  });
  return this.save();
};

// Method to get user's registered events
userSchema.methods.getRegisteredEvents = async function() {
  const Event = require('./Event');
  return await Event.find({
    'attendees.user': this._id
  }).populate('organizer', 'name email');
};

// Method to get user's organized events
userSchema.methods.getOrganizedEvents = async function() {
  const Event = require('./Event');
  return await Event.find({
    organizer: this._id
  }).populate('attendees.user', 'name email');
};

// Gamification methods
userSchema.methods.addPoints = function(points, reason = 'Activity completed') {
  this.gamification.points += points;
  
  // Check for level up
  const newLevel = Math.floor(this.gamification.points / 100) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
  }
  
  // Add achievement
  this.gamification.achievements.push({
    name: reason,
    description: `Earned ${points} points`,
    points: points,
    earnedAt: new Date()
  });
  
  return this.save();
};

userSchema.methods.addBadge = function(badgeName, description, category, icon = '🏆') {
  // Check if badge already exists
  const existingBadge = this.gamification.badges.find(b => b.name === badgeName);
  if (existingBadge) {
    return existingBadge;
  }
  
  const badge = {
    name: badgeName,
    description,
    icon,
    category,
    earnedAt: new Date()
  };
  
  this.gamification.badges.push(badge);
  return this.save();
};

userSchema.methods.updateStats = function(statType, value = 1) {
  if (this.gamification.stats[statType] !== undefined) {
    this.gamification.stats[statType] += value;
  }
  return this.save();
};

userSchema.methods.getLeaderboardStats = function() {
  return {
    name: this.name,
    points: this.gamification.points,
    level: this.gamification.level,
    badges: this.gamification.badges.length,
    eventsAttended: this.gamification.stats.eventsAttended,
    eventsOrganized: this.gamification.stats.eventsOrganized
  };
};

// AI recommendation methods
userSchema.methods.updateAIPreferences = function(interests, categories, times, venues) {
  this.aiPreferences.interests = interests || this.aiPreferences.interests;
  this.aiPreferences.preferredCategories = categories || this.aiPreferences.preferredCategories;
  this.aiPreferences.preferredTimes = times || this.aiPreferences.preferredTimes;
  this.aiPreferences.preferredVenues = venues || this.aiPreferences.preferredVenues;
  this.aiPreferences.lastRecommendationUpdate = new Date();
  return this.save();
};

userSchema.methods.getRecommendationScore = function(event) {
  let score = 0;
  
  // Category preference
  if (this.aiPreferences.preferredCategories.includes(event.category)) {
    score += 20;
  }
  
  // Time preference
  const eventTime = event.time;
  if (this.aiPreferences.preferredTimes.includes(eventTime)) {
    score += 15;
  }
  
  // Venue preference
  if (this.aiPreferences.preferredVenues.includes(event.venue)) {
    score += 10;
  }
  
  // Interest matching
  const eventTags = event.tags || [];
  const matchingInterests = this.aiPreferences.interests.filter(interest => 
    eventTags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
  );
  score += matchingInterests.length * 5;
  
  return score;
};

// Virtual for backward compatibility
userSchema.virtual('role').get(function() {
  return this.currentRole;
});

userSchema.virtual('role').set(function(value) {
  this.currentRole = value;
  if (!this.roles.includes(value)) {
    this.roles.push(value);
  }
});

module.exports = mongoose.model('User', userSchema);