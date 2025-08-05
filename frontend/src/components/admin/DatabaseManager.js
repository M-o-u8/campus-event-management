import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Refresh, Delete } from '@mui/icons-material';
import axios from 'axios';

const DatabaseManager = () => {
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [message, setMessage] = useState('');

  const checkDatabase = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/db/status');
      setDbStatus(response.data);
      setMessage('Database status checked successfully');
    } catch (error) {
      setMessage('Failed to check database status: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const resetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will delete ALL users and events!')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      await axios.post('http://localhost:5000/api/auth/db/reset');
      setDbStatus({ userCount: 0 });
      setMessage('Database reset successfully! All data has been cleared.');
    } catch (error) {
      setMessage('Failed to reset database: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const cleanupDatabase = async () => {
    if (!window.confirm('This will fix database index issues. Continue?')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      await axios.post('http://localhost:5000/api/auth/db/cleanup');
      setMessage('Database cleanup completed! Index issues have been fixed.');
      
      checkDatabaseHealth();
    } catch (error) {
      setMessage('Failed to cleanup database: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const checkDatabaseHealth = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/db/health');
      setDbHealth(response.data.health);
      setMessage('Database health check completed');
    } catch (error) {
      setMessage('Failed to check database health: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
          Database Manager (Testing Tool)
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Showcase Tool:</strong> This page helps you manage the database for testing purposes. 
            Use it to check current users or reset the database if you encounter issues.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={checkDatabase}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Check Database Status
          </Button>
          
          <Button
            variant="contained"
            color="warning"
            startIcon={<Refresh />}
            onClick={checkDatabaseHealth}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Check Database Health
          </Button>
          
          <Button
            variant="outlined"
            color="warning"
            onClick={cleanupDatabase}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Fix Index Issues
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={resetDatabase}
            disabled={loading}
          >
            Reset Database
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Processing...</Typography>
          </Box>
        )}

        {message && (
          <Alert 
            severity={message.includes('successfully') ? 'success' : 'error'} 
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        {dbStatus && (
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Database Status
            </Typography>
            <Typography variant="body1">
              Total Users: <strong>{dbStatus.userCount}</strong>
            </Typography>
            
            {dbStatus.userCount === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  No users in database. You can now register new accounts without conflicts.
                </Typography>
              </Alert>
            )}
          </Paper>
        )}

        {dbHealth && (
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#fff3cd', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Database Health
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Documents with null id: <strong>{dbHealth.nullIdCount}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Documents with undefined id: <strong>{dbHealth.undefinedIdCount}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Total users: <strong>{dbHealth.totalUsers}</strong>
            </Typography>
            <Typography variant="body2">
              Indexes: <strong>{dbHealth.indexes}</strong>
            </Typography>
            
            {(dbHealth.nullIdCount > 0 || dbHealth.undefinedIdCount > 0) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Database has corrupted data. Click "Fix Index Issues" to resolve.
                </Typography>
              </Alert>
            )}
          </Paper>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Troubleshooting Tips:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Registration Error: 'Email already exists'"
              secondary="Click 'Reset Database' to clear all users and try registering again."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Login Error: 'Account not found'"
              secondary="The user might not exist or there's a database issue. Check status and reset if needed."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="General Issues"
              secondary="If you encounter persistent issues, reset the database and start fresh."
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default DatabaseManager; 