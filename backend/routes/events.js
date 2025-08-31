const express = require('express');
const EventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Event CRUD operations
router.post('/', EventController.createEvent);
router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);

// Event registration
router.post('/:id/register', EventController.registerForEvent);
router.delete('/:id/unregister', EventController.unregisterFromEvent);

// Event clash detection
router.post('/check-clashes', EventController.checkEventClashes);

// Event feedback
router.get('/:id/feedback', EventController.getEventFeedback);
router.post('/:id/feedback', EventController.submitEventFeedback);
router.put('/:id/feedback', EventController.updateEventFeedback);

// Admin operations
router.post('/:id/approve', EventController.approveEvent);
router.post('/:id/reject', EventController.rejectEvent);
router.get('/admin/pending', EventController.getPendingEvents);

// User events
router.get('/user/events', EventController.getUserEvents);

module.exports = router; 