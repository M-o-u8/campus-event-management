import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Set default headers for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token and get user data
          const response = await axios.get('http://localhost:5000/api/auth/profile');
          setCurrentUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userToken, userData) => {
    try {
      // Store token
      localStorage.setItem('token', userToken);
      setToken(userToken);
      
      // Set default headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      // Set user data
      setCurrentUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear token and user data
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    
    // Remove default headers
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const switchRole = async (newRole) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/switch-role', {
        newRole
      });
      
      if (response.data.currentRole) {
        setCurrentUser(prev => ({
          ...prev,
          currentRole: response.data.currentRole
        }));
        return { success: true, newRole: response.data.currentRole };
      }
    } catch (error) {
      console.error('Role switch error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', profileData);
      
      if (response.data.user) {
        setCurrentUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/preferences', preferences);
      
      if (response.data.preferences) {
        setCurrentUser(prev => ({
          ...prev,
          preferences: response.data.preferences
        }));
        return { success: true, preferences: response.data.preferences };
      }
    } catch (error) {
      console.error('Preferences update error:', error);
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = !!token && !!currentUser;

  const value = {
    currentUser,
    token,
    loading,
    login,
    logout,
    updateUser,
    switchRole,
    updateProfile,
    updatePreferences,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 