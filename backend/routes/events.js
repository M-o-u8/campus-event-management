const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { authenticateToken, requireOrganizer, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const { category, status, search } = req.query;
        let query = { isActive: true };

        
        if (category) {
            query.category = category;
        }

        
        if (status) {
            query.status = status;
        }

        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(query)
            .populate('organizer', 'name email department')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email department')
            .populate('attendees.user', 'name email department');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
});


router.post('/', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            time,
            venue,
            maxAttendees,
            category,
            tags,
            registrationDeadline,
            resources
        } = req.body;

        
        const existingEvent = await Event.findOne({
            venue,
            date,
            status: { $in: ['pending', 'approved'] },
            isActive: true
        });

        if (existingEvent) {
            return res.status(400).json({ 
                message: 'Venue is already booked for this date' 
            });
        }

        const event = new Event({
            title,
            description,
            date,
            time,
            venue,
            maxAttendees,
            organizer: req.user._id,
            category,
            tags: tags || [],
            registrationDeadline,
            resources: resources || []
        });

        await event.save();

        const populatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email department');

        res.status(201).json({
            message: 'Event created successfully',
            event: populatedEvent
        });

    } catch (error) {
        console.error('Create event error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(error.errors).map(err => err.message) 
            });
        }
        res.status(500).json({ message: 'Failed to create event' });
    }
});


router.put('/:id', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('organizer', 'name email department');

        res.json({
            message: 'Event updated successfully',
            event: updatedEvent
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Failed to update event' });
    }
});


router.delete('/:id', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        
        event.isActive = false;
        await event.save();

        res.json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
});


router.post('/:id/register', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.isActive) {
            return res.status(400).json({ message: 'Event is not active' });
        }

        await event.addAttendee(req.user._id);

        res.json({ message: 'Successfully registered for event' });

    } catch (error) {
        console.error('Event registration error:', error);
        res.status(400).json({ message: error.message });
    }
});


router.delete('/:id/register', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.removeAttendee(req.user._id);

        res.json({ message: 'Successfully unregistered from event' });

    } catch (error) {
        console.error('Event unregistration error:', error);
        res.status(400).json({ message: error.message });
    }
});


router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('organizer', 'name email department');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            message: `Event ${status} successfully`,
            event
        });

    } catch (error) {
        console.error('Update event status error:', error);
        res.status(500).json({ message: 'Failed to update event status' });
    }
});


router.get('/organizer/me', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id })
            .populate('attendees.user', 'name email department')
            .sort({ createdAt: -1 });

        res.json(events);
    } catch (error) {
        console.error('Get organizer events error:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});


router.get('/user/registered', authenticateToken, async (req, res) => {
    try {
        const events = await Event.find({
            'attendees.user': req.user._id,
            isActive: true
        })
        .populate('organizer', 'name email department')
        .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get registered events error:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});

module.exports = router; 