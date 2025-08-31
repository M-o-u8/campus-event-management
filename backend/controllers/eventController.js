const Event = require('../models/Event');
const User = require('../models/User');

class EventController {
  // Create new event
  static async createEvent(req, res) {
    try {
      const eventData = req.body;
      const organizerId = req.user._id; // Fix: use _id instead of userId

      // Validate required fields
      if (!eventData.title || !eventData.description || !eventData.date || !eventData.venue) {
        return res.status(400).json({
          message: 'Missing required fields',
          error: 'Validation failed'
        });
      }

      // Create event with organizer
      const event = new Event({
        ...eventData,
        organizer: organizerId,
        status: 'pending' // Default status for admin approval
      });

      // Check venue availability
      await event.checkVenueAvailability();

      await event.save();

      res.status(201).json({
        message: 'Event created successfully',
        event: event.getSummary()
      });

    } catch (error) {
      console.error('Event creation error:', error);
      res.status(500).json({
        message: 'Failed to create event',
        error: 'Server error'
      });
    }
  }

  // Get all events (with filtering)
  static async getEvents(req, res) {
    try {
      const { category, status, search, page = 1, limit = 10 } = req.query;
      const query = {};

      // Apply filters
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const skip = (page - 1) * limit;
      
      const events = await Event.find(query)
        .populate('organizer', 'name email')
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Event.countDocuments(query);

      res.json({
        events,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('Events fetch error:', error);
      res.status(500).json({
        message: 'Failed to fetch events',
        error: 'Server error'
      });
    }
  }

  // Get event by ID
  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id)
        .populate('organizer', 'name email profile')
        .populate('attendees.user', 'name email profile');

      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      res.json(event);

    } catch (error) {
      console.error('Event fetch error:', error);
      res.status(500).json({
        message: 'Failed to fetch event',
        error: 'Server error'
      });
    }
  }

  // Update event
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user._id; // Fix: use _id instead of userId

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Check if user can edit this event
      if (event.organizer.toString() !== userId.toString() && !req.user.roles.includes('admin')) {
        return res.status(403).json({
          message: 'Access denied',
          error: 'Only organizer or admin can edit events'
        });
      }

      // Check if event can be edited
      if (!event.canBeEdited()) {
        return res.status(400).json({
          message: 'Event cannot be edited',
          error: 'Event is already approved or cancelled'
        });
      }

      // Update event
      await event.updateEvent(updateData);

      res.json({
        message: 'Event updated successfully',
        event: event.getSummary()
      });

    } catch (error) {
      console.error('Event update error:', error);
      res.status(500).json({
        message: 'Failed to update event',
        error: 'Server error'
      });
    }
  }

  // Delete event
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id; // Fix: use _id instead of userId

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Check if user can delete this event
      if (event.organizer.toString() !== userId.toString() && !req.user.roles.includes('admin')) {
        return res.status(403).json({
          message: 'Access denied',
          error: 'Only organizer or admin can delete events'
        });
      }

      // Check if event can be deleted
      if (!event.canBeDeleted()) {
        return res.status(400).json({
          message: 'Event cannot be deleted',
          error: 'Event has attendees or is already approved'
        });
      }

      await Event.findByIdAndDelete(id);

      res.json({
        message: 'Event deleted successfully'
      });

    } catch (error) {
      console.error('Event deletion error:', error);
      res.status(500).json({
        message: 'Failed to delete event',
        error: 'Server error'
      });
    }
  }

  // Register user for event
  static async registerForEvent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id; // Fix: use _id instead of userId

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Check if event is available for registration
      if (event.status !== 'approved') {
        return res.status(400).json({
          message: 'Event not available for registration',
          error: 'Event must be approved by admin'
        });
      }

      // Check if event is full
      if (event.isFull()) {
        return res.status(400).json({
          message: 'Event is full',
          error: 'Maximum attendees reached'
        });
      }

      // Check if user is already registered
      if (event.isUserRegistered(userId)) {
        return res.status(400).json({
          message: 'Already registered',
          error: 'User is already registered for this event'
        });
      }

      // Register user
      const attendee = event.registerUser(userId);
      await event.save();

      res.json({
        message: 'Successfully registered for event',
        attendee
      });

    } catch (error) {
      console.error('Event registration error:', error);
      res.status(500).json({
        message: 'Failed to register for event',
        error: 'Server error'
      });
    }
  }

  // Unregister user from event
  static async unregisterFromEvent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id; // Fix: use _id instead of userId

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Check if user is registered
      if (!event.isUserRegistered(userId)) {
        return res.status(400).json({
          message: 'Not registered',
          error: 'User is not registered for this event'
        });
      }

      // Unregister user
      event.unregisterUser(userId);
      await event.save();

      res.json({
        message: 'Successfully unregistered from event'
      });

    } catch (error) {
      console.error('Event unregistration error:', error);
      res.status(500).json({
        message: 'Failed to unregister from event',
        error: 'Server error'
      });
    }
  }

  // Admin approval of event
  static async approveEvent(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.user._id; // Fix: use _id instead of userId

      // Check if user is admin
      if (!req.user.roles.includes('admin')) {
        return res.status(403).json({
          message: 'Access denied',
          error: 'Admin role required'
        });
      }

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Approve event
      await event.approveEvent(adminId, notes);

      res.json({
        message: 'Event approved successfully',
        event: event.getSummary()
      });

    } catch (error) {
      console.error('Event approval error:', error);
      res.status(500).json({
        message: 'Failed to approve event',
        error: 'Server error'
      });
    }
  }

  // Admin rejection of event
  static async rejectEvent(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user._id; // Fix: use _id instead of userId

      // Check if user is admin
      if (!req.user.roles.includes('admin')) {
        return res.status(403).json({
          message: 'Access denied',
          error: 'Admin role required'
        });
      }

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Reject event
      await event.rejectEvent(adminId, reason);

      res.json({
        message: 'Event rejected successfully',
        event: event.getSummary()
      });

    } catch (error) {
      console.error('Event rejection error:', error);
      res.status(500).json({
        message: 'Failed to reject event',
        error: 'Server error'
      });
    }
  }

  // Get pending events for admin approval
  static async getPendingEvents(req, res) {
    try {
      // Check if user is admin
      if (!req.user.roles.includes('admin')) {
        return res.status(403).json({
          message: 'Access denied',
          error: 'Admin role required'
        });
      }

      const events = await Event.find({ status: 'pending' })
        .populate('organizer', 'name email profile')
        .sort({ createdAt: 1 });

      res.json(events);

    } catch (error) {
      console.error('Pending events fetch error:', error);
      res.status(500).json({
        message: 'Failed to fetch pending events',
        error: 'Server error'
      });
    }
  }

  // Get user's events (organized or registered)
  static async getUserEvents(req, res) {
    try {
      const userId = req.user._id; // Fix: use _id instead of userId
      const { type = 'all' } = req.query;

      let events = [];

      if (type === 'organized' || type === 'all') {
        const organizedEvents = await Event.find({ organizer: userId })
          .populate('attendees.user', 'name email')
          .sort({ date: 1 });
        events.push(...organizedEvents);
      }

      if (type === 'registered' || type === 'all') {
        const registeredEvents = await Event.find({
          'attendees.user': userId
        })
          .populate('organizer', 'name email')
          .sort({ date: 1 });
        events.push(...registeredEvents);
      }

      // Remove duplicates and sort by date
      const uniqueEvents = events.filter((event, index, self) =>
        index === self.findIndex(e => e._id.toString() === event._id.toString())
      );

      res.json(uniqueEvents);

    } catch (error) {
      console.error('User events fetch error:', error);
      res.status(500).json({
        message: 'Failed to fetch user events',
        error: 'Server error'
      });
    }
  }

  // Get event feedback
  static async getEventFeedback(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Find user's feedback
      const userFeedback = event.feedback.find(f => 
        f.user.toString() === userId.toString()
      );

      res.json({
        feedback: userFeedback || null
      });

    } catch (error) {
      console.error('Get feedback error:', error);
      res.status(500).json({
        message: 'Failed to get feedback',
        error: 'Server error'
      });
    }
  }

  // Submit event feedback
  static async submitEventFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, review } = req.body;
      const userId = req.user._id;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Invalid rating. Must be between 1 and 5',
          error: 'Validation failed'
        });
      }

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Check if user is registered for the event
      if (!event.isUserRegistered(userId)) {
        return res.status(400).json({
          message: 'Cannot submit feedback',
          error: 'User must be registered for the event to submit feedback'
        });
      }

      // Check if user already has feedback and update it, otherwise add new feedback
      let feedback;
      try {
        feedback = event.addFeedback(userId, rating, review);
      } catch (error) {
        if (error.message === 'User has already given feedback for this event') {
          // Update existing feedback instead
          feedback = event.updateFeedback(userId, rating, review);
        } else {
          throw error;
        }
      }
      await event.save();

      // Update user stats
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, {
        $inc: { 'profile.stats.feedbackGiven': 1 }
      });

      res.json({
        message: 'Feedback submitted successfully',
        feedback
      });

    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        message: 'Failed to submit feedback',
        error: error.message || 'Server error'
      });
    }
  }

  // Update event feedback
  static async updateEventFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, review } = req.body;
      const userId = req.user._id;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Invalid rating. Must be between 1 and 5',
          error: 'Validation failed'
        });
      }

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          message: 'Event not found',
          error: 'Event not found'
        });
      }

      // Update feedback using the model method
      const updatedFeedback = event.updateFeedback(userId, rating, review);
      await event.save();

      res.json({
        message: 'Feedback updated successfully',
        feedback: updatedFeedback
      });

    } catch (error) {
      console.error('Update feedback error:', error);
      res.status(500).json({
        message: 'Failed to update feedback',
        error: error.message || 'Server error'
      });
    }
  }

  // Check for event clashes
  static async checkEventClashes(req, res) {
    try {
      const { date, time, duration, venue } = req.body;
      const userId = req.user._id;

      // Validate required fields
      if (!date || !time || !duration || !venue) {
        return res.status(400).json({
          message: 'Missing required fields: date, time, duration, venue',
          error: 'Validation failed'
        });
      }

      // Parse the requested time slot
      const requestedStart = new Date(`${date}T${time}`);
      const requestedEnd = new Date(requestedStart.getTime() + duration * 60 * 60 * 1000);

      // Find events on the same date and venue
      // Convert date string to Date object for comparison
      const searchDate = new Date(date);
      const searchDateStart = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
      const searchDateEnd = new Date(searchDateStart.getTime() + 24 * 60 * 60 * 1000);
      
      const existingEvents = await Event.find({
        date: { $gte: searchDateStart, $lt: searchDateEnd },
        venue: venue,
        status: { $in: ['approved', 'pending'] } // Only check approved and pending events
      }).populate('organizer', 'name email');

      const conflicts = [];
      let isAvailable = true;

      // Check each existing event for conflicts
      existingEvents.forEach(event => {
        const eventStart = new Date(`${event.date}T${event.time}`);
        const eventEnd = new Date(eventStart.getTime() + (event.duration || 2) * 60 * 60 * 1000);

        // Check for time overlap
        if (requestedStart < eventEnd && requestedEnd > eventStart) {
          isAvailable = false;
          conflicts.push({
            title: event.title,
            date: event.date,
            time: event.time,
            duration: event.duration || 2,
            organizer: event.organizer?.name || 'Unknown',
            description: event.description,
            eventId: event._id
          });
        }
      });

      // Find alternative dates for the same venue
      const alternativeDates = [];
      if (!isAvailable) {
        const nextWeek = new Date(date);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const alternativeEvents = await Event.find({
          venue: venue,
          date: { $gte: searchDateStart, $lte: nextWeek },
          status: { $in: ['approved', 'pending'] }
        });

        // Find dates with no events
        const dateSet = new Set();
        for (let d = new Date(date); d <= nextWeek; d.setDate(d.getDate() + 1)) {
          dateSet.add(d.toISOString().split('T')[0]);
        }

        alternativeEvents.forEach(event => {
          dateSet.delete(event.date);
        });

        alternativeDates.push(...Array.from(dateSet).slice(0, 5)); // Limit to 5 alternatives
      }

      // Find suggested time slots on the same date
      const suggestedSlots = [];
      if (!isAvailable) {
        const timeSlots = ['09:00', '10:00', '11:00', '13:00', '15:00', '16:00', '17:00'];
        timeSlots.forEach(slot => {
          const slotStart = new Date(`${date}T${slot}`);
          const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000);
          
          let slotAvailable = true;
          existingEvents.forEach(event => {
            const eventStart = new Date(`${event.date}T${event.time}`);
            const eventEnd = new Date(eventStart.getTime() + (event.duration || 2) * 60 * 60 * 1000);
            
            if (slotStart < eventEnd && slotEnd > eventStart) {
              slotAvailable = false;
            }
          });
          
          if (slotAvailable) {
            suggestedSlots.push(slot);
          }
        });
      }

      const result = {
        available: isAvailable,
        venue: venue,
        date: date,
        time: time,
        duration: duration,
        message: isAvailable 
          ? 'No conflicts detected. This time slot is available!' 
          : 'Conflicts detected with existing events.',
        conflicts: conflicts,
        alternativeDates: alternativeDates,
        suggestedSlots: suggestedSlots.slice(0, 3), // Limit to 3 suggestions
        checkedAt: new Date().toISOString()
      };

      res.json(result);

    } catch (error) {
      console.error('Event clash check error:', error);
      res.status(500).json({
        message: 'Failed to check for event clashes',
        error: 'Server error'
      });
    }
  }
}

module.exports = EventController;
