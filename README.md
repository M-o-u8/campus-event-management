# 🎓 Campus Event Management System

A comprehensive web application for managing campus events with role-based access control, real-time features, and advanced analytics.

## ✨ Features

### 🔐 User Authentication & Role Management
- **Multi-role System**: Student, Organizer, and Admin roles
- **Secure Login/Registration**: JWT-based authentication
- **Role-based Access Control**: Different dashboards and permissions for each role
- **Profile Management**: User profiles with customizable settings

### 📅 Event Management
- **Event Creation**: Organizers can create events with comprehensive details
- **Event Approval Workflow**: Admin approval system for events
- **Event Categories**: Academic, Social, Sports, Cultural, Technical, Workshop, Other
- **Event Tags**: Flexible tagging system for better organization
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurring events

### 🎫 Registration & Attendance
- **Event Registration**: Students can register for events
- **Attendance Tracking**: QR code-based attendance system
- **Waiting List Management**: Automatic waiting list when events are full
- **Ticket Management**: Different ticket types (Regular, VIP, Student, Early Bird)
- **Payment Integration**: Built-in payment system with wallet functionality

### 📍 Venue & Resource Management
- **Venue Booking**: Real-time venue availability checking
- **Event Clash Detection**: Automatic conflict detection for venues
- **Resource Management**: Equipment and resource allocation
- **Google Maps Integration**: Venue location with interactive maps

### 📊 Analytics & Reporting
- **Comprehensive Dashboard**: Real-time statistics and metrics
- **Event Analytics**: Attendance rates, popularity metrics, feedback analysis
- **Category Distribution**: Visual charts for event categories
- **Monthly Trends**: Event and registration trends over time
- **Export Functionality**: CSV and JSON report exports
- **Performance Metrics**: Top-performing events and organizers

### 🖼️ Media Management
- **Photo & Video Uploads**: Support for multiple media types
- **Event Gallery**: Organized media display for each event
- **Cloud Storage**: Cloudinary integration for media storage
- **Media Preview**: Lightbox-style media viewing

### 🔔 Notifications & Communication
- **Email Notifications**: Automated email reminders and updates
- **In-app Notifications**: Real-time notification system
- **Event Reminders**: Automated reminders before events
- **Status Updates**: Notifications for event changes and approvals

### 📱 Mobile & Accessibility
- **Responsive Design**: Mobile-first responsive interface
- **Touch-friendly**: Optimized for mobile devices
- **Progressive Web App**: PWA capabilities for mobile users

### 🔍 Search & Discovery
- **Advanced Search**: Search by title, category, date, venue
- **Smart Filtering**: Multiple filter options for events
- **Calendar View**: Interactive calendar with event display
- **Event Discovery**: Personalized event recommendations

### 📈 Advanced Features
- **QR Code Generation**: Unique QR codes for each registration
- **QR Code Scanning**: Mobile attendance tracking
- **Google Calendar Export**: ICS file export for calendar integration
- **Feedback System**: Post-event rating and review system
- **Community Features**: User interaction and engagement tools

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time features
- **Multer** for file uploads
- **Cloudinary** for media storage
- **Nodemailer** for email notifications
- **QR Code** generation and scanning

### Frontend
- **React.js** with hooks
- **Material-UI** for components
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **React Big Calendar** for calendar view
- **React Dropzone** for file uploads
- **Date-fns** for date manipulation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure your environment variables in .env
npm start
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/campus-events
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
```

## 📱 Usage Guide

### For Students
1. **Register/Login**: Create an account or sign in
2. **Browse Events**: View upcoming events by category
3. **Register for Events**: Click register button for events
4. **View Calendar**: See your registered events in calendar view
5. **QR Code Tickets**: Download QR codes for event entry
6. **Provide Feedback**: Rate and review events after attendance

### For Organizers
1. **Create Events**: Fill out event creation form
2. **Upload Media**: Add photos and videos to events
3. **Manage Registrations**: View and manage attendee lists
4. **Track Attendance**: Use QR scanner for attendance
5. **View Analytics**: See event performance metrics
6. **Update Events**: Modify event details as needed

### For Admins
1. **Event Approval**: Review and approve pending events
2. **User Management**: Manage user accounts and roles
3. **Analytics Dashboard**: View comprehensive system analytics
4. **System Reports**: Generate and export detailed reports
5. **Venue Management**: Monitor venue conflicts and availability
6. **Content Moderation**: Moderate event content and media

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/clash-detection` - Check venue conflicts
- `GET /api/events/:id/export-calendar` - Export to calendar

### Analytics
- `GET /api/events/analytics/overview` - Get analytics overview
- `GET /api/events/analytics/export` - Export analytics report

### Media
- `POST /api/events/:id/media` - Upload event media
- `GET /api/events/:id/media` - Get event media
- `DELETE /api/events/:id/media/:mediaId` - Delete media

## 🎨 UI Components

### Core Components
- **EventCalendar**: Interactive calendar with event display
- **EventMedia**: Media upload and gallery management
- **EventClashDetector**: Venue conflict detection
- **EnhancedAnalytics**: Comprehensive analytics dashboard
- **GoogleMaps**: Venue location integration
- **QRCodeGenerator**: QR code generation for tickets
- **QRCodeScanner**: Mobile attendance tracking

### Dashboard Components
- **StudentDashboard**: Student-specific features and views
- **OrganizerDashboard**: Event creation and management
- **AdminDashboard**: System administration and analytics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permission system
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting for security
- **CORS Protection**: Cross-origin resource sharing security
- **Helmet Security**: Security headers and protection

## 📊 Performance Features

- **Database Indexing**: Optimized database queries
- **Image Optimization**: Automatic image compression and resizing
- **Lazy Loading**: Efficient component loading
- **Caching**: Smart caching for frequently accessed data
- **Compression**: Response compression for faster loading

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy build folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔮 Future Enhancements

- **Mobile App**: Native mobile applications
- **AI Integration**: Smart event recommendations
- **Social Features**: Enhanced community engagement
- **Advanced Analytics**: Machine learning insights
- **Integration APIs**: Third-party service integrations
- **Multi-language Support**: Internationalization
- **Advanced Notifications**: Push notifications and SMS

---

**Built with ❤️ for better campus event management**

