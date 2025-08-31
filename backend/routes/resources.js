const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireOrganizer } = require('../middleware/auth');
const Resource = require('../models/Resource');
const Event = require('../models/Event');

// Get all resources (with filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, type, available, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (type) query.type = type;
    if (available !== undefined) query.isAvailable = available === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      resources,
      total: resources.length,
      filters: { category, type, available, search }
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
});

// Get resource by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo.event', 'title date time venue');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);

  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ message: 'Failed to fetch resource' });
  }
});

// Create new resource (Admin/Organizer only)
router.post('/', authenticateToken, requireOrganizer, async (req, res) => {
  try {
    const {
      name, type, category, description, location, capacity,
      requirements, costPerHour, currency, images
    } = req.body;

    if (!name || !type || !category || !location) {
      return res.status(400).json({
        message: 'Name, type, category, and location are required'
      });
    }

    const resource = new Resource({
      name,
      type,
      category,
      description,
      location,
      capacity: capacity || 1,
      requirements: requirements || [],
      costPerHour: costPerHour || 0,
      currency: currency || 'USD',
      images: images || [],
      createdBy: req.user._id
    });

    await resource.save();

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });

  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Failed to create resource' });
  }
});

// Update resource (Admin/Organizer only)
router.put('/:id', authenticateToken, requireOrganizer, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is creator or admin
    if (resource.createdBy.toString() !== req.user._id.toString() && req.user.currentRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Resource updated successfully',
      resource: updatedResource
    });

  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Failed to update resource' });
  }
});

// Delete resource (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if resource is currently assigned
    const activeAssignments = resource.assignedTo.filter(
      assignment => assignment.status === 'pending' || assignment.status === 'approved'
    );

    if (activeAssignments.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete resource with active assignments',
        activeAssignments: activeAssignments.length
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resource deleted successfully' });

  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
});

// Check resource availability
router.post('/:id/check-availability', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required'
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        message: 'Start date must be before end date'
      });
    }

    const isAvailable = resource.isAvailableForPeriod(start, end);
    const availability = resource.getAvailabilityForRange(start, end);
    const conflictingEvents = resource.getConflictingEvents(start, end);

    res.json({
      resourceId: resource._id,
      resourceName: resource.name,
      isAvailable,
      availability,
      conflictingEvents,
      suggestion: isAvailable ? 'Resource is available' : 'Resource is not available for the specified period'
    });

  } catch (error) {
    console.error('Error checking resource availability:', error);
    res.status(500).json({ message: 'Failed to check resource availability' });
  }
});

// Assign resource to event
router.post('/:id/assign', authenticateToken, requireOrganizer, async (req, res) => {
  try {
    const { eventId, startDate, endDate } = req.body;
    
    if (!eventId || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Event ID, start date, and end date are required'
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is event organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to assign resources for this event' });
    }

    // Check availability
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (!resource.isAvailableForPeriod(start, end)) {
      return res.status(409).json({
        message: 'Resource is not available for the specified period',
        conflictingEvents: resource.getConflictingEvents(start, end)
      });
    }

    // Assign resource
    await resource.assignToEvent(eventId, start, end);

    res.json({
      message: 'Resource assigned successfully',
      assignment: resource.assignedTo[resource.assignedTo.length - 1]
    });

  } catch (error) {
    console.error('Error assigning resource:', error);
    res.status(500).json({ message: 'Failed to assign resource' });
  }
});

// Release resource from event
router.post('/:id/release', authenticateToken, requireOrganizer, async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({
        message: 'Event ID is required'
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is event organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to release resources for this event' });
    }

    // Release resource
    await resource.releaseFromEvent(eventId);

    res.json({
      message: 'Resource released successfully'
    });

  } catch (error) {
    console.error('Error releasing resource:', error);
    res.status(500).json({ message: 'Failed to release resource' });
  }
});

// Get resource utilization statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    let start, end;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 30);
    }

    const stats = resource.getUtilizationStats(start, end);

    res.json({
      resourceId: resource._id,
      resourceName: resource.name,
      period: { start, end },
      stats
    });

  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({ message: 'Failed to fetch resource statistics' });
  }
});

// Get resources by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const { available } = req.query;
    
    let query = { category };
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const resources = await Resource.find(query)
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.json({
      category,
      resources,
      total: resources.length
    });

  } catch (error) {
    console.error('Error fetching resources by category:', error);
    res.status(500).json({ message: 'Failed to fetch resources by category' });
  }
});

// Get available resources for a time period
router.post('/available', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required'
      });
    }

    let query = {
      isAvailable: true,
      maintenanceStatus: 'operational'
    };

    if (category) query.category = category;
    if (type) query.type = type;

    const resources = await Resource.find(query);
    const availableResources = [];

    for (const resource of resources) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (resource.isAvailableForPeriod(start, end)) {
        availableResources.push({
          ...resource.toObject(),
          availability: resource.getAvailabilityForRange(start, end)
        });
      }
    }

    res.json({
      period: { startDate, endDate },
      availableResources,
      total: availableResources.length
    });

  } catch (error) {
    console.error('Error fetching available resources:', error);
    res.status(500).json({ message: 'Failed to fetch available resources' });
  }
});

// Admin: Get resource statistics overview (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const availableResources = await Resource.countDocuments({ isAvailable: true });
    const unavailableResources = await Resource.countDocuments({ isAvailable: false });
    
    // Resources by type
    const resourcesByType = await Resource.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Resources by category
    const resourcesByCategory = await Resource.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Resources by maintenance status
    const resourcesByMaintenance = await Resource.aggregate([
      {
        $group: {
          _id: '$maintenanceStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recently added resources (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentResources = await Resource.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      totalResources,
      availableResources,
      unavailableResources,
      resourcesByType,
      resourcesByCategory,
      resourcesByMaintenance,
      recentResources
    });

  } catch (error) {
    console.error('Error getting resource stats:', error);
    res.status(500).json({ message: 'Failed to get resource statistics' });
  }
});

module.exports = router;




