import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/dashboards/StudentDashboard';
import OrganizerDashboard from './components/dashboards/OrganizerDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import Profile from './components/common/Profile';
import ChatBot from './components/common/ChatBot';
import Community from './components/common/Community';
import PrivateRoute from './components/auth/PrivateRoute';

// FIXED: Correct import path for Navbar
import Navbar from './layout/Navbar';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/student"
                element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizer"
                element={
                  <PrivateRoute allowedRoles={['organizer']}>
                    <OrganizerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute allowedRoles={['student', 'organizer', 'admin']}>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <PrivateRoute allowedRoles={['student', 'organizer', 'admin']}>
                    <Community />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            <ChatBot />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
