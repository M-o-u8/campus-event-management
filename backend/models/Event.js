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
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true,
        trim: true
    },
    maxAttendees: {
        type: Number,
        required: true,
        min: 1
    },
    currentAttendees: {
        type: Number,
        default: 0
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['academic', 'cultural', 'sports', 'technical', 'social', 'other']
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    image: {
        type: String,
        default: ''
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
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
        available: {
            type: Boolean,
            default: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


eventSchema.virtual('isFull').get(function() {
    return this.currentAttendees >= this.maxAttendees;
});


eventSchema.virtual('isRegistrationOpen').get(function() {
    return new Date() < this.registrationDeadline;
});


eventSchema.methods.addAttendee = function(userId) {
    if (this.isFull) {
        throw new Error('Event is full');
    }
    if (!this.isRegistrationOpen) {
        throw new Error('Registration deadline has passed');
    }
    
    const existingAttendee = this.attendees.find(attendee => 
        attendee.user.toString() === userId.toString()
    );
    
    if (existingAttendee) {
        throw new Error('User already registered for this event');
    }
    
    this.attendees.push({ user: userId });
    this.currentAttendees += 1;
    return this.save();
};


eventSchema.methods.removeAttendee = function(userId) {
    const attendeeIndex = this.attendees.findIndex(attendee => 
        attendee.user.toString() === userId.toString()
    );
    
    if (attendeeIndex === -1) {
        throw new Error('User not registered for this event');
    }
    
    this.attendees.splice(attendeeIndex, 1);
    this.currentAttendees -= 1;
    return this.save();
};

module.exports = mongoose.model('Event', eventSchema);