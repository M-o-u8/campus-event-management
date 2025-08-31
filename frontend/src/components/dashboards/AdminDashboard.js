import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Add,
  Notifications,
  Build,
  Event,
  People,
  Assignment,
  Warning,
  Info,
  ExpandMore,
  Send,
  Schedule,
  LocationOn,
  AttachMoney,
  NotificationsActive,
  Psychology,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [notificationStats, setNotificationStats] = useState({});
  const [resourceStats, setResourceStats] = useState({});
  
  // Dialog states
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [openNotificationViewDialog, setOpenNotificationViewDialog] = useState(false);
  const [openResourceDialog, setOpenResourceDialog] = useState(false);
  const [openEventPermissionDialog, setOpenEventPermissionDialog] = useState(false);
  
  // Form data states
  const [editingUser, setEditingUser] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    department: '',
    phone: '',
    password: '',
    isActive: true
  });
  
  const [notificationFormData, setNotificationFormData] = useState({
    title: '',
    message: '',
    type: 'event_update',
    priority: 'normal',
    recipients: []
  });
  
  const [resourceFormData, setResourceFormData] = useState({
    name: '',
    description: '',
    category: 'equipment',
    quantity: 1,
    cost: 0,
    location: '',
    maintenanceSchedule: ''
  });
  
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!currentUser) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const [
        eventsRes, 
        usersRes, 
        notificationsRes, 
        resourcesRes
      ] = await Promise.all([
        axios.get('/api/events', authHeaders),
        axios.get('/api/users', authHeaders),
        axios.get('/api/notifications/admin', authHeaders),
        axios.get('/api/resources', authHeaders)
      ]);
      
      setEvents(eventsRes.data.events || eventsRes.data);
      setUsers(usersRes.data);
      setStats({
        totalUsers: usersRes.data.length || 0,
        totalEvents: (eventsRes.data.events || eventsRes.data).length || 0
      });
      setNotifications(notificationsRes.data.notifications || notificationsRes.data || []);
      setNotificationStats({
        totalNotifications: (notificationsRes.data.notifications || notificationsRes.data || []).length || 0
      });
      setResources(resourcesRes.data.resources || resourcesRes.data || []);
      setResourceStats({
        totalResources: (resourcesRes.data.resources || resourcesRes.data || []).length || 0
      });
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Event Management Functions
  const handleApproveEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.patch(`/api/events/${eventId}/status`, { status: 'approved' }, authHeaders);
      fetchData();
    } catch (error) {
      console.error('Approval error:', error);
      setError(error.response?.data?.message || 'Failed to approve event');
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.patch(`/api/events/${eventId}/status`, { status: 'rejected' }, authHeaders);
      fetchData();
    } catch (error) {
      console.error('Rejection error:', error);
      setError(error.response?.data?.message || 'Failed to reject event');
    }
  };

  const handleEventPermission = (event) => {
    setSelectedEvent(event);
    setOpenEventPermissionDialog(true);
  };

  const handleCheckAvailability = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get(`/api/events/${event._id}/availability`, authHeaders);
      
      // Update the event with availability info
      const updatedEvents = events.map(e => 
        e._id === event._id ? { ...e, venueAvailability: response.data.venueAvailability } : e
      );
      setEvents(updatedEvents);
      
    } catch (error) {
      console.error('Availability check error:', error);
      setError('Failed to check event availability');
    }
  };

  // User Management Functions
  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        name: user.name,
        email: user.email,
        role: user.currentRole || user.role,
        department: user.profile?.department || '',
        phone: user.profile?.phone || '',
        password: '', // Don't show password when editing
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        name: '',
        email: '',
        role: 'student',
        department: '',
        phone: '',
        password: '',
        isActive: true
      });
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setEditingUser(null);
  };

  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      if (editingUser) {
        // Update existing user (don't send password if empty)
        const updateData = { ...userFormData };
        if (!updateData.password) {
          delete updateData.password;
        }
        const response = await axios.put(`/api/users/${editingUser._id}`, updateData, authHeaders);
      } else {
        // Create new user
        const response = await axios.post('/api/users', userFormData, authHeaders);
      }
      
      fetchData();
      handleCloseUserDialog();
    } catch (error) {
      console.error('User save error:', error);
      setError(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const authHeaders = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.delete(`/api/users/${userId}`, authHeaders);
        fetchData();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  // Notification Management Functions
  const handleOpenNotificationDialog = () => {
    setNotificationFormData({
      title: '',
      message: '',
      type: 'announcement',
      priority: 'normal',
      recipients: []
    });
    setOpenNotificationDialog(true);
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setOpenNotificationViewDialog(true);
  };

  const handleEditNotification = (notification) => {
    setNotificationFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      recipients: notification.recipients || []
    });
    setSelectedNotification(notification);
    setOpenNotificationDialog(true);
  };

  const handleCloseNotificationDialog = () => {
    setOpenNotificationDialog(false);
    setSelectedNotification(null);
    setNotificationFormData({
      title: '',
      message: '',
      type: 'announcement',
      priority: 'normal',
      recipients: []
    });
  };

  const handleCreateNotification = async () => {
    try {
      if (!notificationFormData.title || !notificationFormData.message || !notificationFormData.type) {
        setError('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (selectedNotification) {
        // Update existing notification
        const response = await axios.put(`/api/notifications/${selectedNotification._id}`, notificationFormData, authHeaders);
      } else {
        // Create new notification
        const response = await axios.post('/api/notifications', notificationFormData, authHeaders);
      }
      
      setOpenNotificationDialog(false);
      setSelectedNotification(null);
      fetchData();
      setError('');
    } catch (error) {
      console.error('Notification save error:', error);
      setError(error.response?.data?.message || 'Failed to save notification');
    }
  };

  const handleUpdateNotificationStatus = async (notificationId, status) => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.patch(`/api/notifications/${notificationId}/status`, { status }, authHeaders);
      fetchData();
    } catch (error) {
      setError('Failed to update notification status');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const token = localStorage.getItem('token');
        const authHeaders = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.delete(`/api/notifications/${notificationId}`, authHeaders);
        fetchData();
      } catch (error) {
        setError('Failed to delete notification');
      }
    }
  };

  // Resource Management Functions
  const handleOpenResourceDialog = (resource = null) => {
    if (resource) {
      setResourceFormData({
        name: resource.name,
        description: resource.description || '',
        category: resource.category,
        quantity: resource.quantity,
        cost: resource.cost,
        location: resource.location || '',
        maintenanceSchedule: resource.maintenanceSchedule?.maintenanceNotes || ''
      });
    } else {
      setResourceFormData({
        name: '',
        description: '',
        category: 'equipment',
        quantity: 1,
        cost: 0,
        location: '',
        maintenanceSchedule: ''
      });
    }
    setOpenResourceDialog(true);
  };

  const handleCloseResourceDialog = () => {
    setOpenResourceDialog(false);
  };

  const handleCreateResource = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.post('/api/resources', resourceFormData, authHeaders);
      fetchData();
      handleCloseResourceDialog();
    } catch (error) {
      setError('Failed to create resource');
    }
  };

  const handleAssignResource = async (resourceId, eventId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post(`/api/resources/${resourceId}/assign`, {
        eventId,
        assignedTo: userId,
        notes: 'Assigned by admin'
      }, authHeaders);
      fetchData();
    } catch (error) {
      setError('Failed to assign resource');
    }
  };

  const handleReleaseResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post(`/api/resources/${resourceId}/release`, {}, authHeaders);
      fetchData();
    } catch (error) {
      setError('Failed to release resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const token = localStorage.getItem('token');
        const authHeaders = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.delete(`/api/resources/${resourceId}`, authHeaders);
        fetchData();
      } catch (error) {
        setError('Failed to delete resource');
      }
    }
  };

  // Utility Functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const getRoleColor = (role) => {
    const colors = {
      student: 'primary',
      organizer: 'secondary',
      admin: 'error'
    };
    return colors[role] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      normal: 'primary',
      high: 'warning',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.totalUsers || 0}
              </Typography>
              <Typography variant="body2">
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div">
                {events.length}
              </Typography>
              <Typography variant="body2">
                Total Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div">
                {notificationStats.totalNotifications || 0}
              </Typography>
              <Typography variant="body2">
                Notifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div">
                {resourceStats.totalResources || 0}
              </Typography>
              <Typography variant="body2">
                Resources
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Event Permissions" icon={<Event />} />
        <Tab label="User Management" icon={<People />} />
        <Tab label="Notifications" icon={<NotificationsIcon />} />
        <Tab label="Resources" icon={<Build />} />
        <Tab label="AI Recommendations" icon={<Psychology />} />
      </Tabs>
      


      {/* Event Permissions Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event Title</TableCell>
                <TableCell>Organizer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(events || []).filter(event => event.status === 'pending').map((event) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.description?.substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{event.organizer?.name}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    <Chip 
                      label={event.status} 
                      color={getStatusColor(event.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleApproveEvent(event._id)}
                      color="success"
                      title="Approve Event"
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRejectEvent(event._id)}
                      color="error"
                      title="Reject Event"
                    >
                      <Cancel />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEventPermission(event)}
                      color="primary"
                      title="Manage Permissions"
                    >
                      <Assignment />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleCheckAvailability(event)}
                      color="info"
                      title="Check Availability"
                    >
                      <Info />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Management Tab */}
      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleOpenUserDialog()}
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
                }
              }}
            >
              Add User
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.currentRole || user.role} 
                        color={getRoleColor(user.currentRole || user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.profile?.department || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenUserDialog(user)}
                        color="primary"
                        title="Edit User"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user._id)}
                        color="error"
                        title="Delete User"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Notifications Tab */}
      {tabValue === 2 && (
                <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleOpenNotificationDialog}
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #F57C00 30%, #E65100 90%)',
                }
              }}
            >
              Create Notification
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.type} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.priority} 
                        color={getPriorityColor(notification.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.status} 
                        color={getStatusColor(notification.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(notification.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewNotification(notification)}
                        color="info"
                        title="View Details"
                      >
                        <Info />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditNotification(notification)}
                        color="primary"
                        title="Edit Notification"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateNotificationStatus(notification._id, 'sent')}
                        color="success"
                        title="Mark as Sent"
                        disabled={notification.status === 'sent'}
                      >
                        <Send />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteNotification(notification._id)}
                        color="error"
                        title="Delete Notification"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Resources Tab */}
      {tabValue === 3 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleOpenResourceDialog()}
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7B1FA2 30%, #6A1B9A 90%)',
                }
              }}
            >
              Add Resource
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource._id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {resource.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {resource.description?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={resource.category} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={resource.status} 
                        color={resource.isAvailable ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{resource.location || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${resource.cost}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenResourceDialog(resource)}
                        color="primary"
                        title="Edit Resource"
                      >
                        <Edit />
                      </IconButton>
                      {resource.isAvailable ? (
                        <IconButton
                          size="small"
                          onClick={() => handleAssignResource(resource._id, null, null)}
                          color="secondary"
                          title="Assign Resource"
                        >
                          <Assignment />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => handleReleaseResource(resource._id)}
                          color="success"
                          title="Release Resource"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteResource(resource._id)}
                        color="error"
                        title="Delete Resource"
                        disabled={!resource.isAvailable}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* AI Recommendations Tab */}
      {tabValue === 4 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI-Powered Event Recommendation System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monitor and manage the AI recommendation engine that provides personalized event suggestions to users.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommendation Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Track recommendation performance and user engagement
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      • Content-based filtering accuracy
                    </Typography>
                    <Typography variant="body2">
                      • Collaborative filtering performance
                    </Typography>
                    <Typography variant="body2">
                      • User preference learning rate
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trending Events
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monitor which events are gaining popularity
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      • Real-time popularity metrics
                    </Typography>
                    <Typography variant="body2">
                      • Category-based trends
                    </Typography>
                    <Typography variant="body2">
                      • User engagement patterns
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI System Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current status of recommendation algorithms and user preference learning
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label="Learning Mode" 
                      color="info" 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label="High Accuracy" 
                      color="success" 
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* User Edit Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  required
                />
              </Grid>
              {!editingUser && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                    required
                    helperText="Password is required for new users"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={userFormData.role}
                    label="Role"
                    onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="organizer">Organizer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department"
                  value={userFormData.department}
                  onChange={(e) => setUserFormData({...userFormData, department: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={userFormData.isActive}
                    label="Status"
                    onChange={(e) => setUserFormData({...userFormData, isActive: e.target.value})}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
              }
            }}
          >
            {editingUser ? 'Update User' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Create Dialog */}
      <Dialog open={openNotificationDialog} onClose={handleCloseNotificationDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNotification ? 'Edit Notification' : 'Create New Notification'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={notificationFormData.title}
                  onChange={(e) => setNotificationFormData({...notificationFormData, title: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  value={notificationFormData.message}
                  onChange={(e) => setNotificationFormData({...notificationFormData, message: e.target.value})}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={notificationFormData.type}
                    label="Type"
                    onChange={(e) => setNotificationFormData({...notificationFormData, type: e.target.value})}
                  >
                    <MenuItem value="announcement">Announcement</MenuItem>
                    <MenuItem value="event_update">Event Update</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="reminder">Reminder</MenuItem>
                    <MenuItem value="alert">Alert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={notificationFormData.priority}
                    label="Priority"
                    onChange={(e) => setNotificationFormData({...notificationFormData, priority: e.target.value})}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotificationDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateNotification} 
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #F57C00 30%, #E65100 90%)',
              }
            }}
          >
            {selectedNotification ? 'Update Notification' : 'Create Notification'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification View Dialog */}
      <Dialog open={openNotificationViewDialog} onClose={() => setOpenNotificationViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Notification Details</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Title</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedNotification.title}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Message</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedNotification.message}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>Type</Typography>
                  <Chip 
                    label={selectedNotification.type} 
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>Priority</Typography>
                  <Chip 
                    label={selectedNotification.priority} 
                    color={getPriorityColor(selectedNotification.priority)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>Status</Typography>
                  <Chip 
                    label={selectedNotification.status} 
                    color={getStatusColor(selectedNotification.status)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>Created</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedNotification.createdAt)}
                  </Typography>
                </Grid>
                {selectedNotification.recipients && selectedNotification.recipients.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Recipients</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedNotification.recipients.length} specific recipients
                    </Typography>
                  </Grid>
                )}
                {selectedNotification.recipients && selectedNotification.recipients.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Recipients</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Global notification (all users)
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotificationViewDialog(false)}>Close</Button>
          <Button 
            onClick={() => {
              setOpenNotificationViewDialog(false);
              handleEditNotification(selectedNotification);
            }} 
            variant="contained"
            color="primary"
          >
            Edit Notification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resource Create/Edit Dialog */}
      <Dialog open={openResourceDialog} onClose={handleCloseResourceDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={resourceFormData.name}
                  onChange={(e) => setResourceFormData({...resourceFormData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={resourceFormData.description}
                  onChange={(e) => setResourceFormData({...resourceFormData, description: e.target.value})}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={resourceFormData.category}
                    label="Category"
                    onChange={(e) => setResourceFormData({...resourceFormData, category: e.target.value})}
                  >
                    <MenuItem value="equipment">Equipment</MenuItem>
                    <MenuItem value="venue">Venue</MenuItem>
                    <MenuItem value="furniture">Furniture</MenuItem>
                    <MenuItem value="technology">Technology</MenuItem>
                    <MenuItem value="supplies">Supplies</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={resourceFormData.quantity}
                  onChange={(e) => setResourceFormData({...resourceFormData, quantity: parseInt(e.target.value)})}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Cost ($)"
                  type="number"
                  value={resourceFormData.cost}
                  onChange={(e) => setResourceFormData({...resourceFormData, cost: parseFloat(e.target.value)})}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={resourceFormData.location}
                  onChange={(e) => setResourceFormData({...resourceFormData, location: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maintenance Schedule"
                  value={resourceFormData.maintenanceSchedule}
                  onChange={(e) => setResourceFormData({...resourceFormData, maintenanceSchedule: e.target.value})}
                  multiline
                  rows={2}
                  placeholder="e.g., Monthly cleaning, Annual inspection"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResourceDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateResource} 
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7B1FA2 30%, #6A1B9A 90%)',
              }
            }}
          >
            Create Resource
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Permission Dialog */}
      <Dialog open={openEventPermissionDialog} onClose={() => setOpenEventPermissionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Event Permissions & Resources</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedEvent.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Event Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {formatDate(selectedEvent.date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Venue:</strong> {selectedEvent.venue}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Max Attendees:</strong> {selectedEvent.maxAttendees}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Status:</strong> 
                    <Chip 
                      label={selectedEvent.status} 
                      color={getStatusColor(selectedEvent.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Available Resources
              </Typography>
              <List dense>
                {resources.filter(r => r.isAvailable).slice(0, 5).map((resource) => (
                  <ListItem key={resource._id}>
                    <ListItemText
                      primary={resource.name}
                      secondary={`${resource.category} - ${resource.location || 'No location'}`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAssignResource(resource._id, selectedEvent._id, selectedEvent.organizer?._id)}
                      >
                        Assign
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventPermissionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 