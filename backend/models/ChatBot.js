const mongoose = require('mongoose');

const chatBotSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    messages: [{
        type: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        intent: {
            type: String,
            default: 'general'
        },
        confidence: {
            type: Number,
            default: 0
        }
    }],
    context: {
        currentTopic: {
            type: String,
            default: 'general'
        },
        lastIntent: String,
        userPreferences: {
            interests: [String],
            role: String,
            theme: String
        },
        sessionData: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'ended'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
chatBotSchema.index({ sessionId: 1 });
chatBotSchema.index({ user: 1 });
chatBotSchema.index({ createdAt: -1 });

// Method to add a message to the conversation
chatBotSchema.methods.addMessage = function(type, content, intent = 'general', confidence = 0) {
    this.messages.push({
        type,
        content,
        intent,
        confidence,
        timestamp: new Date()
    });
    this.lastActivity = new Date();
    return this.save();
};

// Method to get conversation summary
chatBotSchema.methods.getSummary = function() {
    return {
        sessionId: this.sessionId,
        messageCount: this.messages.length,
        lastActivity: this.lastActivity,
        currentTopic: this.context.currentTopic
    };
};

module.exports = mongoose.model('ChatBot', chatBotSchema);

