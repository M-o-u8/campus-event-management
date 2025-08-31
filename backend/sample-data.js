const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Resource = require('./models/Resource');
const Notification = require('./models/Notification');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-events')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    // Clear existing data first
    await Event.deleteMany({});
    await Resource.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing events, resources, and notifications');

    // Find or create users
    let adminUser = await User.findOne({ email: 'admin@campus.edu' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Mahia Memu',
        email: 'admin@campus.edu',
        password: 'admin123',
        roles: ['admin', 'organizer', 'student'], // Multiple roles for testing
        currentRole: 'admin',
        isActive: true,
        profile: {
          department: 'Administration',
          phone: '+1234567890',
          bio: 'System Administrator with multiple roles'
        }
      });
      await adminUser.save();
      console.log('Admin user created');
    } else {
      adminUser.name = 'Mahia Memu';
      adminUser.roles = ['admin', 'organizer', 'student']; // Multiple roles for testing
      adminUser.currentRole = 'admin';
      adminUser.profile = {
        department: 'Administration',
        phone: '+1234567890',
        bio: 'System Administrator with multiple roles'
      };
      await adminUser.save();
      console.log('Admin user updated with multiple roles');
    }

    // Create multiple organizers
    let organizerUser1 = await User.findOne({ email: 'organizer@campus.edu' });
    if (!organizerUser1) {
      organizerUser1 = new User({
        name: 'Sajid Sarower',
        email: 'organizer@campus.edu',
        password: 'organizer123',
        roles: ['organizer', 'student'], // Multiple roles for testing
        currentRole: 'organizer',
        isActive: true,
        profile: {
          department: 'Events Department',
          phone: '+1234567891',
          bio: 'Professional Event Organizer with multiple roles'
        }
      });
      await organizerUser1.save();
      console.log('Organizer 1 (Sajid Sarower) created');
    } else {
      organizerUser1.name = 'Sajid Sarower';
      organizerUser1.roles = ['organizer', 'student']; // Multiple roles for testing
      organizerUser1.currentRole = 'organizer';
      organizerUser1.profile = {
        department: 'Events Department',
        phone: '+1234567891',
        bio: 'Professional Event Organizer with multiple roles'
      };
      await organizerUser1.save();
      console.log('Organizer 1 (Sajid Sarower) updated with multiple roles');
    }

    // Create second organizer
    let organizerUser2 = await User.findOne({ email: 'sports@campus.edu' });
    if (!organizerUser2) {
      organizerUser2 = new User({
        name: 'Sarah Johnson',
        email: 'sports@campus.edu',
        password: 'sports123',
        roles: ['organizer'],
        currentRole: 'organizer',
        isActive: true,
        profile: {
          department: 'Sports Department',
          phone: '+1234567892',
          bio: 'Sports Event Coordinator'
        }
      });
      await organizerUser2.save();
      console.log('Organizer 2 (Sarah Johnson) created');
    } else {
      organizerUser2.name = 'Sarah Johnson';
      organizerUser2.roles = ['organizer'];
      organizerUser2.currentRole = 'organizer';
      organizerUser2.profile = {
        department: 'Sports Department',
        phone: '+1234567892',
        bio: 'Sports Event Coordinator'
      };
      await organizerUser2.save();
      console.log('Organizer 2 (Sarah Johnson) updated');
    }

    // Create third organizer
    let organizerUser3 = await User.findOne({ email: 'academic@campus.edu' });
    if (!organizerUser3) {
      organizerUser3 = new User({
        name: 'Dr. Michael Chen',
        email: 'academic@campus.edu',
        password: 'academic123',
        roles: ['organizer'],
        currentRole: 'organizer',
        isActive: true,
        profile: {
          department: 'Computer Science',
          phone: '+1234567893',
          bio: 'Professor and Academic Event Organizer'
        }
      });
      await organizerUser3.save();
      console.log('Organizer 3 (Dr. Michael Chen) created');
    } else {
      organizerUser3.name = 'Dr. Michael Chen';
      organizerUser3.roles = ['organizer'];
      organizerUser3.currentRole = 'organizer';
      organizerUser3.profile = {
        department: 'Computer Science',
        phone: '+1234567893',
        bio: 'Professor and Academic Event Organizer'
      };
      await organizerUser3.save();
      console.log('Organizer 3 (Dr. Michael Chen) updated');
    }

    // Create fourth organizer
    let organizerUser4 = await User.findOne({ email: 'cultural@campus.edu' });
    if (!organizerUser4) {
      organizerUser4 = new User({
        name: 'Priya Patel',
        email: 'cultural@campus.edu',
        password: 'cultural123',
        roles: ['organizer'],
        currentRole: 'organizer',
        isActive: true,
        profile: {
          department: 'Cultural Affairs',
          phone: '+1234567894',
          bio: 'Cultural Events Director'
        }
      });
      await organizerUser4.save();
      console.log('Organizer 4 (Priya Patel) created');
    } else {
      organizerUser4.name = 'Priya Patel';
      organizerUser4.roles = ['organizer'];
      organizerUser4.currentRole = 'organizer';
      organizerUser4.profile = {
        department: 'Cultural Affairs',
        phone: '+1234567894',
        bio: 'Cultural Events Director'
      };
      await organizerUser4.save();
      console.log('Organizer 4 (Priya Patel) updated');
    }

    let studentUser = await User.findOne({ email: 'student@campus.edu' });
    if (!studentUser) {
      studentUser = new User({
        name: 'John Student',
        email: 'student@campus.edu',
        password: 'student123',
        roles: ['student'],
        currentRole: 'student',
        isActive: true,
        profile: {
          department: 'Computer Science',
          phone: '+1234567895',
          bio: 'Final year student'
        }
      });
      await studentUser.save();
      console.log('Student user created');
    } else {
      studentUser.name = 'John Student';
      studentUser.roles = ['student'];
      studentUser.currentRole = 'student';
      studentUser.profile = {
        department: 'Computer Science',
        phone: '+1234567895',
        bio: 'Final year student'
      };
      await studentUser.save();
      console.log('Student user updated');
    }

    console.log('Users ready');

    // Create sample events for Sajid Sarower (Events Department)
    const culturalFestival = new Event({
      title: 'Campus Cultural Festival 2025',
      description: 'A vibrant celebration of diversity featuring music, dance, art exhibitions, and food from around the world. Join us for an unforgettable cultural experience!',
      category: 'cultural',
      tags: ['culture', 'music', 'dance', 'art', 'food', 'diversity'],
      date: new Date('2025-09-15'),
      time: '18:00',
      venue: 'Campus Green & Main Auditorium',
      maxAttendees: 500,
      organizer: organizerUser1._id,
      status: 'approved',
      isAvailable: true,
      isPaid: false,
      eventType: 'offline',
      registrationDeadline: new Date('2025-09-13'),
      feedback: [
        {
          user: studentUser._id,
          rating: 5,
          review: 'Amazing event! Loved the cultural performances.',
          createdAt: new Date()
        }
      ],
      averageRating: 5
    });

    const techSummit = new Event({
      title: 'Tech Innovation Summit 2025',
      description: 'Join industry leaders and innovators for a day of cutting-edge technology discussions, workshops, and networking opportunities. Learn about AI, blockchain, and future tech trends.',
      category: 'technical',
      tags: ['technology', 'innovation', 'AI', 'blockchain', 'networking', 'workshop'],
      date: new Date('2025-09-20'),
      time: '09:00',
      venue: 'Main Auditorium & Tech Labs',
      maxAttendees: 200,
      organizer: organizerUser1._id,
      status: 'pending', // This will show in admin dashboard for approval
      isAvailable: true,
      isPaid: true,
      ticketPricing: [
        { type: 'student', price: 25, available: 100, sold: 0 },
        { type: 'regular', price: 75, available: 80, sold: 0 },
        { type: 'vip', price: 150, available: 20, sold: 0 }
      ],
      currency: 'USD',
      eventType: 'offline',
      registrationDeadline: new Date('2025-09-18'),
      feedback: [
        {
          user: studentUser._id,
          rating: 4,
          review: 'Great insights on emerging technologies!',
          createdAt: new Date()
        }
      ],
      averageRating: 4
    });

    const marketingWorkshop = new Event({
      title: 'Digital Marketing Masterclass',
      description: 'Learn advanced digital marketing strategies from industry experts. Covering SEO, social media marketing, content creation, and analytics.',
      category: 'academic',
      tags: ['marketing', 'digital', 'SEO', 'social media', 'workshop', 'online'],
      date: new Date('2025-09-25'),
      time: '14:00',
      venue: 'Online',
      maxAttendees: 100,
      organizer: organizerUser1._id,
      status: 'approved',
      isAvailable: true,
      isPaid: true,
      ticketPricing: [
        { type: 'student', price: 15, available: 50, sold: 0 },
        { type: 'regular', price: 35, available: 50, sold: 0 }
      ],
      currency: 'USD',
      eventType: 'online',
      onlineMeetingPlatform: 'zoom',
      onlineMeetingLink: 'https://zoom.us/j/123456789',
      registrationDeadline: new Date('2025-09-23'),
      feedback: [
        {
          user: studentUser._id,
          rating: 5,
          review: 'Excellent workshop with practical tips!',
          createdAt: new Date()
        }
      ],
      averageRating: 5
    });

    // Create events for Sarah Johnson (Sports Department)
    const basketballTournament = new Event({
      title: 'Inter-College Basketball Championship',
      description: 'Annual basketball tournament featuring teams from various colleges. Exciting matches, prizes, and networking opportunities for sports enthusiasts.',
      category: 'sports',
      tags: ['basketball', 'tournament', 'competition', 'sports', 'championship'],
      date: new Date('2025-10-10'),
      time: '10:00',
      venue: 'Campus Basketball Court & Gymnasium',
      maxAttendees: 300,
      organizer: organizerUser2._id,
      status: 'approved',
      isAvailable: true,
      isPaid: false,
      eventType: 'offline',
      registrationDeadline: new Date('2025-10-08'),
      feedback: [
        {
          user: studentUser._id,
          rating: 5,
          review: 'Amazing tournament! Great competition and organization.',
          createdAt: new Date()
        }
      ],
      averageRating: 5
    });

    const fitnessBootcamp = new Event({
      title: 'Winter Fitness Bootcamp',
      description: 'Intensive fitness program designed to help you stay active during winter. Includes cardio, strength training, and nutrition guidance.',
      category: 'sports',
      tags: ['fitness', 'bootcamp', 'workout', 'health', 'winter'],
      date: new Date('2025-10-15'),
      time: '07:00',
      venue: 'Campus Fitness Center',
      maxAttendees: 50,
      organizer: organizerUser2._id,
      status: 'approved',
      isAvailable: true,
      isPaid: true,
      ticketPricing: [
        { type: 'student', price: 20, available: 30, sold: 0 },
        { type: 'regular', price: 40, available: 20, sold: 0 }
      ],
      currency: 'USD',
      eventType: 'offline',
      registrationDeadline: new Date('2025-10-13'),
      feedback: [
        {
          user: studentUser._id,
          rating: 4,
          review: 'Great workout session! Really challenging.',
          createdAt: new Date()
        }
      ],
      averageRating: 4
    });

    // Create events for Dr. Michael Chen (Computer Science)
    const codingWorkshop = new Event({
      title: 'Advanced Python Programming Workshop',
      description: 'Learn advanced Python concepts including data structures, algorithms, and machine learning basics. Hands-on coding sessions included.',
      category: 'academic',
      tags: ['python', 'programming', 'workshop', 'coding', 'computer science'],
      date: new Date('2025-10-20'),
      time: '15:00',
      venue: 'Computer Science Lab 101',
      maxAttendees: 40,
      organizer: organizerUser3._id,
      status: 'approved',
      isAvailable: true,
      isPaid: false,
      eventType: 'offline',
      registrationDeadline: new Date('2025-10-18'),
      feedback: [
        {
          user: studentUser._id,
          rating: 5,
          review: 'Excellent workshop! Learned so much about Python.',
          createdAt: new Date()
        }
      ],
      averageRating: 5
    });

    const aiSeminar = new Event({
      title: 'AI Ethics and Future Implications',
      description: 'Discussion on the ethical considerations of artificial intelligence and its impact on society. Expert panel discussion followed by Q&A.',
      category: 'academic',
      tags: ['AI', 'ethics', 'seminar', 'discussion', 'technology'],
      date: new Date('2025-10-25'),
      time: '16:00',
      venue: 'Main Lecture Hall',
      maxAttendees: 150,
      organizer: organizerUser3._id,
      status: 'approved',
      isAvailable: true,
      isPaid: false,
      eventType: 'offline',
      registrationDeadline: new Date('2025-10-23'),
      feedback: [
        {
          user: studentUser._id,
          rating: 4,
          review: 'Very informative discussion on AI ethics.',
          createdAt: new Date()
        }
      ],
      averageRating: 4
    });

    // Create events for Priya Patel (Cultural Affairs)
    const artExhibition = new Event({
      title: 'Student Art Exhibition: "Expressions of Youth"',
      description: 'Showcase of student artwork including paintings, sculptures, digital art, and photography. Vote for your favorite pieces!',
      category: 'cultural',
      tags: ['art', 'exhibition', 'student work', 'creativity', 'gallery'],
      date: new Date('2025-11-01'),
      time: '11:00',
      venue: 'Campus Art Gallery',
      maxAttendees: 200,
      organizer: organizerUser4._id,
      status: 'approved',
      isAvailable: true,
      isPaid: false,
      eventType: 'offline',
      registrationDeadline: new Date('2025-10-30'),
      feedback: [
        {
          user: studentUser._id,
          rating: 5,
          review: 'Beautiful artwork! Very talented students.',
          createdAt: new Date()
        }
      ],
      averageRating: 5
    });

    const musicConcert = new Event({
      title: 'Winter Music Concert',
      description: 'Enjoy an evening of classical and contemporary music performed by campus musicians. Featuring orchestra, choir, and solo performances.',
      category: 'cultural',
      tags: ['music', 'concert', 'orchestra', 'choir', 'classical', 'winter'],
      date: new Date('2025-11-05'),
      time: '19:00',
      venue: 'Campus Concert Hall',
      maxAttendees: 400,
      organizer: organizerUser4._id,
      status: 'approved',
      isAvailable: true,
      isPaid: true,
      ticketPricing: [
        { type: 'student', price: 10, available: 200, sold: 0 },
        { type: 'regular', price: 25, available: 150, sold: 0 },
        { type: 'vip', price: 50, available: 50, sold: 0 }
      ],
      currency: 'USD',
      eventType: 'offline',
      registrationDeadline: new Date('2025-11-03'),
      feedback: [
        {
          user: studentUser._id,
          rating: 5,
          review: 'Magical evening of beautiful music!',
          createdAt: new Date()
        }
      ],
      averageRating: 5
    });

    // Save all events
    await culturalFestival.save();
    await techSummit.save();
    await marketingWorkshop.save();
    await basketballTournament.save();
    await fitnessBootcamp.save();
    await codingWorkshop.save();
    await aiSeminar.save();
    await artExhibition.save();
    await musicConcert.save();

    console.log('All events created successfully');

    // Create sample resources
    const projector = new Resource({
      name: 'HD Projector',
      description: 'High-definition projector for presentations and screenings',
      type: 'technology',
      category: 'projector',
      location: 'Storage Room A',
      capacity: 5,
      costPerHour: 50,
      createdBy: adminUser._id
    });

    const chairs = new Resource({
      name: 'Folding Chairs',
      description: 'Comfortable folding chairs for events and gatherings',
      type: 'furniture',
      category: 'chairs',
      location: 'Storage Room B',
      capacity: 100,
      costPerHour: 2.5,
      createdBy: adminUser._id
    });

    const soundSystem = new Resource({
      name: 'Portable Sound System',
      description: 'Professional audio system with microphones and speakers',
      type: 'technology',
      category: 'sound_system',
      location: 'Storage Room A',
      capacity: 2,
      costPerHour: 80,
      createdBy: adminUser._id
    });

    const lighting = new Resource({
      name: 'Stage Lighting Kit',
      description: 'Professional stage lighting with multiple colors and effects',
      type: 'technology',
      category: 'other',
      location: 'Storage Room A',
      capacity: 3,
      costPerHour: 120,
      createdBy: adminUser._id
    });

    // Save resources
    await projector.save();
    await chairs.save();
    await soundSystem.save();
    await lighting.save();

    console.log('Resources created successfully');

    // Create sample notifications
    const welcomeNotification = new Notification({
      title: 'Welcome to Campus Events!',
      message: 'Thank you for joining our platform. We hope you enjoy discovering and participating in exciting campus events.',
      type: 'event_update',
      priority: 'normal',
      status: 'unread',
      user: adminUser._id
    });

    const eventReminder = new Notification({
      title: 'Event Reminder: Tech Innovation Summit',
      message: 'Don\'t forget! Tech Innovation Summit 2024 is tomorrow at 9:00 AM in the Main Auditorium.',
      type: 'event_reminder',
      priority: 'high',
      status: 'unread',
      eventId: techSummit._id,
      user: adminUser._id
    });

    const approvalNotification = new Notification({
      title: 'Event Approval Required',
      message: 'New event "Tech Innovation Summit 2024" requires admin approval. Please review and approve/reject.',
      type: 'event_update',
      priority: 'high',
      status: 'unread',
      eventId: techSummit._id,
      user: adminUser._id
    });

    const resourceNotification = new Notification({
      title: 'Resource Assignment',
      message: 'HD Projector and Sound System have been assigned to Campus Cultural Festival.',
      type: 'event_update',
      priority: 'normal',
      status: 'unread',
      eventId: culturalFestival._id,
      user: adminUser._id
    });

    // Save notifications
    await welcomeNotification.save();
    await eventReminder.save();
    await approvalNotification.save();
    await resourceNotification.save();

    console.log('Notifications created successfully');

    console.log('Sample data creation completed!');
    console.log('\nSample Users:');
    console.log(`Admin (Mahia Memu): ${adminUser.email} / admin123`);
    console.log(`Organizer 1 (Sajid Sarower - Events): ${organizerUser1.email} / organizer123`);
    console.log(`Organizer 2 (Sarah Johnson - Sports): ${organizerUser2.email} / sports123`);
    console.log(`Organizer 3 (Dr. Michael Chen - CS): ${organizerUser3.email} / academic123`);
    console.log(`Organizer 4 (Priya Patel - Cultural): ${organizerUser4.email} / cultural123`);
    console.log(`Student (John Student): ${studentUser.email} / student123`);
    console.log('\nEvents Created:');
    console.log(`Sajid Sarower (Events Dept):`);
    console.log(`  - Campus Cultural Festival (Free, Approved)`);
    console.log(`  - Tech Innovation Summit (Paid, Pending Approval)`);
    console.log(`  - Digital Marketing Masterclass (Paid, Online, Approved)`);
    console.log(`Sarah Johnson (Sports Dept):`);
    console.log(`  - Inter-College Basketball Championship (Free, Approved)`);
    console.log(`  - Winter Fitness Bootcamp (Paid, Approved)`);
    console.log(`Dr. Michael Chen (CS Dept):`);
    console.log(`  - Advanced Python Programming Workshop (Free, Approved)`);
    console.log(`  - AI Ethics and Future Implications (Free, Approved)`);
    console.log(`Priya Patel (Cultural Affairs):`);
    console.log(`  - Student Art Exhibition (Free, Approved)`);
    console.log(`  - Winter Music Concert (Paid, Approved)`);
    console.log('\nResources Available:');
    console.log(`- HD Projector, Folding Chairs, Sound System, Stage Lighting`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();
