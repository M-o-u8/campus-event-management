# Campus Event Management - Frontend

A modern React application for managing campus events with role-based access control.

## Features

### 1. User Authentication & Registration
- **Login/Register**: Beautiful forms with role selection (Student/Organizer/Admin)
- **Role-based Routing**: Automatic redirection to appropriate dashboards
- **JWT Authentication**: Secure token-based authentication

### 2. Role-Based Dashboards

#### Student Dashboard
- Browse all available events
- Search and filter events by category
- Register/unregister for events
- View registered events
- Real-time attendee count updates

#### Organizer Dashboard
- Create new events with detailed forms
- Edit existing events
- Delete events
- View event status and attendee lists
- Manage event details (venue, date, time, capacity)

#### Admin Dashboard
- Approve/reject pending events
- Manage all users (add, edit, delete)
- View system statistics
- Monitor event and user activity

### 3. Modern UI/UX
- **Material-UI**: Beautiful, responsive design
- **Colorful Theme**: Gradient backgrounds and vibrant colors
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, animations, and smooth transitions

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend server is running on `http://localhost:5000`

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── PrivateRoute.js
│   ├── dashboards/
│   │   ├── StudentDashboard.js
│   │   ├── OrganizerDashboard.js
│   │   └── AdminDashboard.js
│   └── layout/
│       └── Navbar.js
├── contexts/
│   └── AuthContext.js
└── App.js
```

## Technology Stack

- **React 18** - Frontend framework
- **Material-UI** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management

## API Integration

The frontend communicates with the backend API endpoints:

- Authentication: `/api/auth/*`
- Events: `/api/events/*`
- Users: `/api/users/*`

## Features Implemented

✅ **User Authentication** - Login/Register with role selection
✅ **Role-Based Access Control** - Different dashboards for each role
✅ **Event Management** - Create, edit, delete, and approve events
✅ **User Management** - Admin can manage all users
✅ **Modern UI** - Colorful, responsive design with Material-UI
✅ **Real-time Updates** - Live data updates and status changes

## Getting Started

1. Start the backend server first
2. Start the frontend development server
3. Register as different user types to test all features
4. Create events as an organizer
5. Approve events as an admin
6. Register for events as a student

## Demo Users

You can create test accounts with different roles:
- **Student**: Can browse and register for events
- **Organizer**: Can create and manage events
- **Admin**: Can approve events and manage users
