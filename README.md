# 🎓 Campus Event Management System

A full-stack MERN application for managing campus events with role-based access control, featuring a modern and colorful UI.

## 🚀 Features

### ✅ Core Features Implemented

1. **User Authentication & Registration**
   - Beautiful login/register forms with role selection
   - JWT-based authentication
   - Role-based routing and access control

2. **Role-Based Dashboards**
   - **Student Dashboard**: Browse events, register/unregister, search and filter
   - **Organizer Dashboard**: Create, edit, delete events, manage event details
   - **Admin Dashboard**: Approve/reject events, manage users, view analytics

3. **Event Management**
   - Create events with detailed information (title, description, date, venue, capacity)
   - Event categorization (academic, cultural, sports, technical, social, other)
   - Venue availability checking
   - Attendee registration with capacity limits
   - Event approval workflow

### 🎨 Modern UI/UX
- **Material-UI**: Professional and responsive design
- **Colorful Theme**: Gradient backgrounds and vibrant colors
- **Interactive Elements**: Hover effects, animations, smooth transitions
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - Frontend framework
- **Material-UI** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## 📁 Project Structure

```
campus-event-management/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboards/
│   │   │   └── layout/
│   │   ├── contexts/
│   │   └── App.js
│   ├── package.json
│   └── README.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-events
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 👥 User Roles & Permissions

### Student
- ✅ Browse all available events
- ✅ Search and filter events by category
- ✅ Register/unregister for events
- ✅ View registered events
- ❌ Create or manage events

### Organizer
- ✅ Create new events
- ✅ Edit own events
- ✅ Delete own events
- ✅ View event attendees
- ✅ Manage event details
- ❌ Approve other organizers' events

### Admin
- ✅ Approve/reject all events
- ✅ Manage all users (add, edit, delete)
- ✅ View system statistics
- ✅ Monitor all events and users
- ✅ Full system access

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (organizer/admin)
- `PUT /api/events/:id` - Update event (organizer/admin)
- `DELETE /api/events/:id` - Delete event (organizer/admin)
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event
- `PATCH /api/events/:id/status` - Approve/reject event (admin)

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics

## 🎨 UI Features

### Colorful Design
- **Primary**: Blue gradients (#2196F3)
- **Secondary**: Pink accents (#f50057)
- **Success**: Green (#4caf50)
- **Warning**: Orange (#ff9800)
- **Error**: Red (#f44336)

### Interactive Elements
- Hover effects on cards and buttons
- Smooth transitions and animations
- Responsive grid layouts
- Modern form designs with validation

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Start development server
```

### Database
Make sure MongoDB is running locally or update the MONGODB_URI in your `.env` file to point to your MongoDB instance.

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables for production
2. Use a process manager like PM2
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to platforms like Vercel, Netlify, or GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Demo

To test the application:

1. **Register as different user types**:
   - Create a student account
   - Create an organizer account  
   - Create an admin account

2. **Test the workflow**:
   - Login as organizer and create events
   - Login as admin and approve events
   - Login as student and register for events

3. **Explore features**:
   - Search and filter events
   - Manage user accounts
   - View system statistics

---

**Built with ❤️ using MERN Stack** 