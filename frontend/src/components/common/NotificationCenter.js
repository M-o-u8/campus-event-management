import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  MarkEmailRead as MarkReadIcon,
  Email as EmailIcon,
  PushPin as PushIcon,
  Sms as SmsIcon,
  Smartphone as MobileIcon,
  Schedule,
  Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';

const NotificationCenter = ({ compact = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [filter, setFilter] = useState('all'); // all, unread, read, archived

  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
    fetchPreferences();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/notifications?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unread);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreferences(response.data.preferences || {});
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, status: 'read' } : n
      ));
      fetchNotificationCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsArchived = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, status: 'archived' } : n
      ));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      fetchNotificationCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      fetchNotificationCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/preferences', newPreferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPreferences(newPreferences);
      setSettingsOpen(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_reminder':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'event_update':
        return <NotificationsIcon sx={{ color: 'info.main' }} />;
      case 'registration_confirmation':
        return <MarkReadIcon sx={{ color: 'success.main' }} />;
      case 'badge_earned':
        return <PushIcon sx={{ color: 'primary.main' }} />;
      case 'points_earned':
        return <StarIcon sx={{ color: 'warning.main' }} />;
      default:
        return <NotificationsIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event_reminder':
        return 'warning';
      case 'event_update':
        return 'info';
      case 'registration_confirmation':
        return 'success';
      case 'badge_earned':
        return 'primary';
      case 'points_earned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  if (compact) {
    return (
      <Box>
        <IconButton
          color="inherit"
          onClick={() => setSettingsOpen(true)}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Notification Center</DialogTitle>
          <DialogContent>
            <NotificationCenter compact={false} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Notifications
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Box>
          <Button
            size="small"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            sx={{ mr: 1 }}
          >
            Mark All Read
          </Button>
          <IconButton
            size="small"
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Notifications List */}
      {loading ? (
        <LinearProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : notifications.length === 0 ? (
        <Box textAlign="center" py={4}>
          <NotificationsOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications`}
          </Typography>
        </Box>
      ) : (
        <List>
          {notifications.map((notification) => (
            <Card key={notification._id} sx={{ mb: 2 }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type.replace('_', ' ')}
                        color={getNotificationColor(notification.type)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={notification.priority}
                        color={getPriorityColor(notification.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ ml: 2 }}>
                    {notification.status === 'unread' && (
                      <IconButton
                        size="small"
                        onClick={() => markAsRead(notification._id)}
                        color="primary"
                        title="Mark as read"
                      >
                        <MarkReadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => markAsArchived(notification._id)}
                      color="secondary"
                      title="Archive"
                    >
                      <ArchiveIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteNotification(notification._id)}
                      color="error"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Notification Preferences</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Channels
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.email || false}
                      onChange={(e) => setPreferences({ ...preferences, email: e.target.checked })}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.push || false}
                      onChange={(e) => setPreferences({ ...preferences, push: e.target.checked })}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.sms || false}
                      onChange={(e) => setPreferences({ ...preferences, sms: e.target.checked })}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.inApp || false}
                      onChange={(e) => setPreferences({ ...preferences, inApp: e.target.checked })}
                    />
                  }
                  label="In-App Notifications"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.eventReminders || false}
                      onChange={(e) => setPreferences({ ...preferences, eventReminders: e.target.checked })}
                    />
                  }
                  label="Event Reminders"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.updates || false}
                      onChange={(e) => setPreferences({ ...preferences, updates: e.target.checked })}
                    />
                  }
                  label="Event Updates"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.promotions || false}
                      onChange={(e) => setPreferences({ ...preferences, promotions: e.target.checked })}
                    />
                  }
                  label="Promotions"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={() => updatePreferences(preferences)} variant="contained">
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;
