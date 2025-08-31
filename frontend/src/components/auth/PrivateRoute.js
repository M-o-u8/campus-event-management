import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.currentRole)) {
    // Redirect to appropriate dashboard based on user's role
    switch (currentUser.currentRole) {
      case 'student':
        return <Navigate to="/student" replace />;
      case 'organizer':
        return <Navigate to="/organizer" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/student" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 