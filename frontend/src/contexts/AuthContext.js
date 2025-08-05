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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [skipProfileCheck, setSkipProfileCheck] = useState(false); // NEW

  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        if (skipProfileCheck) {
          setSkipProfileCheck(false); 
          setLoading(false);
          return;
        }
        try {
          const response = await axios.get('http://localhost:5000/api/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          
          if (user) logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      setSkipProfileCheck(true); 
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorData = error.response?.data;
      return { 
        success: false, 
        error: {
          message: errorData?.message || 'Login failed',
          details: errorData?.details || errorData?.error || 'An unexpected error occurred'
        }
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      setSkipProfileCheck(true); 
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      const errorData = error.response?.data;
      return { 
        success: false, 
        error: {
          message: errorData?.message || 'Registration failed',
          details: errorData?.details || errorData?.error || 'An unexpected error occurred'
        }
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 