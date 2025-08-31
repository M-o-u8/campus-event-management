const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['equipment', 'venue', 'furniture', 'technology', 'other']
  },
  category: {
    type: String,
    required: true,
    enum: ['projector', 'sound_system', 'chairs', 'tables', 'microphone', 'screen', 'hall', 'room', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maintenanceStatus: {
    type: String,
    enum: ['operational', 'maintenance', 'out_of_order'],
    default: 'operational'
  },
  maintenanceNotes: String,
  lastMaintenance: Date,
  nextMaintenance: Date,
  assignedTo: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    }
  }],
  requirements: [String], // Special requirements or instructions
  costPerHour: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  images: [String], // URLs to resource images
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
resourceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Check if resource is available for a specific time period
resourceSchema.methods.isAvailableForPeriod = function(startDate, endDate) {
  if (!this.isAvailable || this.maintenanceStatus !== 'operational') {
    return false;
  }

  // Check if resource is already assigned during this period
  const conflictingAssignment = this.assignedTo.find(assignment => {
    if (assignment.status === 'rejected' || assignment.status === 'completed') {
      return false;
    }
    
    const assignmentStart = new Date(assignment.startDate);
    const assignmentEnd = new Date(assignment.endDate);
    
    return (startDate < assignmentEnd && endDate > assignmentStart);
  });

  return !conflictingAssignment;
};

// Get resource availability for a date range
resourceSchema.methods.getAvailabilityForRange = function(startDate, endDate) {
  const availability = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const isAvailable = this.isAvailableForPeriod(dayStart, dayEnd);
    
    availability.push({
      date: new Date(currentDate),
      available: isAvailable,
      conflictingEvents: isAvailable ? [] : this.getConflictingEvents(dayStart, dayEnd)
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return availability;
};

// Get conflicting events for a resource
resourceSchema.methods.getConflictingEvents = function(startDate, endDate) {
  return this.assignedTo
    .filter(assignment => {
      if (assignment.status === 'rejected' || assignment.status === 'completed') {
        return false;
      }
      
      const assignmentStart = new Date(assignment.startDate);
      const assignmentEnd = new Date(assignment.endDate);
      
      return (startDate < assignmentEnd && endDate > assignmentStart);
    })
    .map(assignment => ({
      eventId: assignment.event,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      status: assignment.status
    }));
};

// Assign resource to an event
resourceSchema.methods.assignToEvent = function(eventId, startDate, endDate) {
  if (!this.isAvailableForPeriod(startDate, endDate)) {
    throw new Error('Resource is not available for the specified period');
  }
  
  this.assignedTo.push({
    event: eventId,
    startDate: startDate,
    endDate: endDate,
    status: 'pending'
  });
  
  return this.save();
};

// Release resource from an event
resourceSchema.methods.releaseFromEvent = function(eventId) {
  const assignmentIndex = this.assignedTo.findIndex(
    assignment => assignment.event.toString() === eventId.toString()
  );
  
  if (assignmentIndex !== -1) {
    this.assignedTo[assignmentIndex].status = 'completed';
    return this.save();
  }
  
  throw new Error('Resource assignment not found for this event');
};

// Get resource utilization statistics
resourceSchema.methods.getUtilizationStats = function(startDate, endDate) {
  const assignments = this.assignedTo.filter(assignment => {
    const assignmentDate = new Date(assignment.startDate);
    return assignmentDate >= startDate && assignmentDate <= endDate;
  });
  
  const totalHours = assignments.reduce((total, assignment) => {
    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    const hours = (end - start) / (1000 * 60 * 60);
    return total + hours;
  }, 0);
  
  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  const utilizationRate = (totalHours / (totalDays * 24)) * 100;
  
  return {
    totalAssignments: assignments.length,
    totalHours: Math.round(totalHours * 100) / 100,
    utilizationRate: Math.round(utilizationRate * 100) / 100,
    averageAssignmentDuration: assignments.length > 0 ? Math.round(totalHours / assignments.length * 100) / 100 : 0
  };
};

module.exports = mongoose.model('Resource', resourceSchema);

