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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Event,
  LocationOn,
  Schedule,
  People,
  Add,
  Edit,
  Delete,
  ExpandMore,
  AttachMoney,
  Repeat,
  Settings,
  Analytics,
  Notifications,
  Resource,
  Share,
  CheckCircle,
  Cancel,
  FilterList
} from '@mui/icons-material';
import EventShare from '../common/EventShare';
import EventBudget from '../common/EventBudget';
import NotificationCenter from '../common/NotificationCenter';
import LiveEventUpdates from '../common/LiveEventUpdates';
import ResourceManager from '../common/ResourceManager';
import EventClashDetector from '../common/EventClashDetector';

const OrganizerDashboard = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    maxAttendees: '',
    category: 'academic',
    tags: '',
    registrationDeadline: '',
    isPaid: false,
    ticketPricing: [
      { type: 'regular', price: '', available: '' },
      { type: 'student', price: '', available: '' },
      { type: 'early_bird', price: '', available: '' }
    ],
    currency: 'USD',
    isRecurring: false,
    recurrence: {
      pattern: 'weekly',
      interval: 1,
      endDate: '',
      daysOfWeek: []
    },
    resources: [],
    venueAvailability: {
      checkRequired: false,
      availableSlots: []
    },
    eventType: 'offline', // 'offline' or 'online'
    onlineMeetingLink: '',
    onlineMeetingPlatform: 'zoom'
  });

  useEffect(() => {
    if (currentUser) {
      fetchEvents();
      fetchAnalytics();
    }
  }, [currentUser, dateRange]);

  const fetchAnalytics = async () => {
    if (!currentUser) return;
    
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/events/analytics/organizer/${currentUser.id || currentUser._id}`, {
        params: dateRange,
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const [allEvents, setAllEvents] = useState([]);
  


  const fetchEvents = async () => {
    try {
      if (!currentUser) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      console.log('Current user:', currentUser);
      console.log('User ID:', currentUser.id || currentUser._id);
      
      // Fetch all events and filter by organizer
      const response = await axios.get('/api/events', authHeaders);
      console.log('All events response:', response.data);
      
      // Handle new API response format with pagination
      const allEvents = response.data.events || response.data;
      
      // Fix the user ID comparison - handle both id and _id
      const currentUserId = currentUser.id || currentUser._id;
      console.log('Current user ID:', currentUserId);
      console.log('All events:', allEvents);
      
      const userEvents = allEvents.filter(event => {
        console.log('Event organizer:', event.organizer);
        console.log('Event organizer ID:', event.organizer?._id);
        console.log('Comparing:', event.organizer?._id, 'with', currentUserId);
        return event.organizer && event.organizer._id === currentUserId;
      });
      console.log('Filtered user events:', userEvents);
      
      setEvents(userEvents);
      setAllEvents(allEvents); // Store all events for the second tab
    } catch (error) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? event.date.split('T')[0] : '',
        time: event.time || '',
        venue: event.venue || '',
        maxAttendees: event.maxAttendees ? event.maxAttendees.toString() : '',
        category: event.category || 'academic',
        tags: event.tags && Array.isArray(event.tags) ? event.tags.join(', ') : '',
        registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
        isPaid: event.isPaid || false,
        price: event.price?.toString() || '',
        currency: event.currency || 'USD',
        isRecurring: event.isRecurring || false,
        recurrence: event.recurrence || {
          pattern: 'weekly',
          interval: 1,
          endDate: '',
          daysOfWeek: []
        },
        resources: event.resources || [],
        venueAvailability: event.venueAvailability || {
          checkRequired: false,
          availableSlots: []
        }
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        maxAttendees: '',
        category: 'academic',
        tags: '',
        registrationDeadline: '',
        isPaid: false,
        price: '',
        currency: 'USD',
        isRecurring: false,
        recurrence: {
          pattern: 'weekly',
          interval: 1,
          endDate: '',
          daysOfWeek: []
        },
        resources: [],
        venueAvailability: {
          checkRequired: false,
          availableSlots: []
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
    
    const eventData = {
      ...formData,
      maxAttendees: parseInt(formData.maxAttendees),
      price: formData.isPaid ? parseFloat(formData.price) : 0,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      resources: formData.resources ? formData.resources.filter(resource => resource.name && resource.quantity > 0) : []
    };

    console.log('Processed event data:', eventData);

    try {
      if (!currentUser) {
        setError('User not authenticated');
        return;
      }

      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Submitting event with auth headers:', authHeaders);

      if (editingEvent) {
        console.log('Updating existing event:', editingEvent._id);
        await axios.put(`/api/events/${editingEvent._id}`, eventData, authHeaders);
      } else {
        console.log('Creating new event');
        await axios.post('/api/events', eventData, authHeaders);
      }
      
      console.log('Event saved successfully, refreshing events...');
      fetchEvents();
      handleCloseDialog();
    } catch (error) {
      console.error('Event submission error:', error);
      setError(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      if (!currentUser) {
        setError('User not authenticated');
        return;
      }

      console.log('Attempting to update event status:', eventId, 'to', newStatus);
      console.log('Current user:', currentUser);

      const token = localStorage.getItem('token');
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      console.log('Status update request headers:', authHeaders);
      
      const response = await axios.patch(`/api/events/${eventId}/status`, {
        status: newStatus
      }, authHeaders);
      
      console.log('Status update response:', response.data);
      
      fetchEvents();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Status update error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to update event status');
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        if (!currentUser) {
          setError('User not authenticated');
          return;
        }

        console.log('Attempting to delete event:', eventId);
        console.log('Current user:', currentUser);

        const token = localStorage.getItem('token');
        const authHeaders = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        console.log('Delete request headers:', authHeaders);
        
        const response = await axios.delete(`/api/events/${eventId}`, authHeaders);
        console.log('Delete response:', response.data);
        
        fetchEvents();
      } catch (error) {
        console.error('Delete error:', error);
        console.error('Error response:', error.response?.data);
        setError(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { name: '', quantity: 1, cost: 0 }]
    }));
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((resource, i) => 
        i === index ? { ...resource, [field]: value } : resource
      )
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'primary',
      cultural: 'secondary',
      sports: 'success',
      technical: 'warning',
      social: 'info',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
          Organizer Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationCenter compact={true} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Create Event
          </Button>
        </Box>
      </Box>
      
      {/* Debug Information */}
      <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Debug Info: Events count: {events.length} | User ID: {currentUser?.id} | Loading: {loading.toString()}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="My Events" />
          <Tab label="All Events" />
          <Tab label="Budget & Expenses" />
                    <Tab label="Live Updates" />
            <Tab label="Certificates" />
            <Tab label="Resources" />
            <Tab label="Clash Detector" />
        </Tabs>
      </Box>

             {/* Event Availability Checker */}




       {/* Enhanced Analytics Section */}
       <Box sx={{ mb: 3 }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <Typography variant="h6" gutterBottom>
             Event Analytics & Insights
           </Typography>
           <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
             <TextField
               type="date"
               label="Start Date"
               value={dateRange.startDate}
               onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
               size="small"
               sx={{ width: 150 }}
             />
             <TextField
               type="date"
               label="End Date"
               value={dateRange.endDate}
               onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
               size="small"
               sx={{ width: 150 }}
             />
             <Button
               variant="outlined"
               onClick={fetchAnalytics}
               disabled={analyticsLoading}
               startIcon={analyticsLoading ? <CircularProgress size={16} /> : <FilterList />}
               size="small"
             >
               Apply
             </Button>
           </Box>
         </Box>

         {analyticsLoading ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
             <CircularProgress />
           </Box>
         ) : analytics ? (
           <Grid container spacing={3}>
             {/* Key Metrics Cards */}
             <Grid item xs={12} md={3}>
               <Card sx={{ p: 2, textAlign: 'center' }}>
                 <Typography variant="h4" color="primary.main" gutterBottom>
                   {analytics.totalEvents}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Total Events
                 </Typography>
               </Card>
             </Grid>
             <Grid item xs={12} md={3}>
               <Card sx={{ p: 2, textAlign: 'center' }}>
                 <Typography variant="h4" color="success.main" gutterBottom>
                   {analytics.approvedEvents}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Approved Events
                 </Typography>
               </Card>
             </Grid>
             <Grid item xs={12} md={3}>
               <Card sx={{ p: 2, textAlign: 'center' }}>
                 <Typography variant="h4" color="warning.main" gutterBottom>
                   {analytics.pendingEvents}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Pending Events
                 </Typography>
               </Card>
             </Grid>
             <Grid item xs={12} md={3}>
               <Card sx={{ p: 2, textAlign: 'center' }}>
                 <Typography variant="h4" color="info.main" gutterBottom>
                   {analytics.totalAttendees}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Total Attendees
                 </Typography>
               </Card>
             </Grid>

             {/* Charts Row */}
             <Grid item xs={12} md={6}>
               <Card sx={{ p: 2, height: 300 }}>
                 <Typography variant="subtitle1" gutterBottom>
                   Events by Category
                 </Typography>
                 <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                   {Object.keys(analytics.eventsByCategory).length > 0 ? (
                     <Typography variant="h6" color="text.secondary">
                       Category Distribution
                     </Typography>
                   ) : (
                     <Typography variant="body2" color="text.secondary">
                       No category data available
                     </Typography>
                   )}
                 </Box>
               </Card>
             </Grid>
             <Grid item xs={12} md={6}>
               <Card sx={{ p: 2, height: 300 }}>
                 <Typography variant="subtitle1" gutterBottom>
                   Events by Status
                 </Typography>
                 <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                   {Object.keys(analytics.eventsByStatus).length > 0 ? (
                     <Typography variant="h6" color="text.secondary">
                       Status Distribution
                     </Typography>
                   ) : (
                     <Typography variant="body2" color="text.secondary">
                       No status data available
                     </Typography>
                   )}
                 </Box>
               </Card>
             </Grid>

             {/* Performance Metrics */}
             <Grid item xs={12}>
               <Card sx={{ p: 2 }}>
                 <Typography variant="subtitle1" gutterBottom>
                   Performance Overview
                 </Typography>
                 <Grid container spacing={2}>
                   <Grid item xs={12} md={6}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                       <Typography variant="body2">Average Rating</Typography>
                       <Typography variant="body2" color="primary.main">
                         {analytics.averageRating}/5.0
                       </Typography>
                     </Box>
                     <LinearProgress 
                       variant="determinate" 
                       value={(analytics.averageRating / 5) * 100} 
                       sx={{ height: 8, borderRadius: 4 }}
                     />
                   </Grid>
                   <Grid item xs={12} md={6}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                       <Typography variant="body2">Approval Rate</Typography>
                       <Typography variant="body2" color="success.main">
                         {analytics.totalEvents > 0 ? Math.round((analytics.approvedEvents / analytics.totalEvents) * 100) : 0}%
                       </Typography>
                     </Box>
                     <LinearProgress 
                       variant="determinate" 
                       value={analytics.totalEvents > 0 ? (analytics.approvedEvents / analytics.totalEvents) * 100 : 0} 
                       sx={{ height: 8, borderRadius: 4 }}
                       color="success"
                     />
                   </Grid>
                 </Grid>
               </Card>
             </Grid>
           </Grid>
         ) : (
           <Alert severity="info">
             No analytics data available. Create some events to see analytics.
           </Alert>
         )}
       </Box>

       {/* Tab Content */}
       {activeTab === 0 && (
         <>
           {/* My Events */}
           <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
             My Created Events
           </Typography>
           <Grid container spacing={3}>
             {events.length === 0 ? (
               <Grid item xs={12}>
                 <Box textAlign="center" py={4}>
                   <Event sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                   <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                     You haven't created any events yet
                   </Typography>
                   <Button
                     variant="contained"
                     startIcon={<Add />}
                     onClick={() => handleOpenDialog()}
                   >
                     Create Your First Event
                   </Button>
                 </Box>
               </Grid>
             ) : (
               events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {event.title}
                    </Typography>
                    <Box>
                      <Chip 
                        label={event.status} 
                        color={getStatusColor(event.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={event.category} 
                        color={getCategoryColor(event.category)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description.substring(0, 100)}...
                  </Typography>

                  {/* Event Features */}
                  <Box sx={{ mb: 2 }}>
                    {event.isPaid && (
                      <Chip 
                        icon={<AttachMoney />}
                        label={`$${event.price}`}
                        color="success"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    {event.isRecurring && (
                      <Chip 
                        icon={<Repeat />}
                        label="Recurring"
                        color="info"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDate(event.date)} at {event.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{event.venue}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {event.currentAttendees}/{event.maxAttendees} attendees
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {event.attendees?.length || 0} registered
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(event)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      {event.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusUpdate(event._id, 'approved')}
                            color="success"
                            title="Approve Event"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusUpdate(event._id, 'rejected')}
                            color="error"
                            title="Reject Event"
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(event._id)}
                        color="error"
                        title="Delete Event"
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShareDialogOpen(true);
                        }}
                        color="secondary"
                      >
                        <Share />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
         </>
       )}

       {activeTab === 1 && (
         <>
           {/* All Events */}
           <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
             All Events in System
           </Typography>
           <Grid container spacing={3}>
             {allEvents.length === 0 ? (
               <Grid item xs={12}>
                 <Box textAlign="center" py={4}>
                   <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                     No events available
                   </Typography>
                 </Box>
               </Grid>
             ) : (
               events.map((event) => (
                 <Grid item xs={12} md={6} lg={4} key={event._id}>
                   <Card 
                     sx={{ 
                       height: '100%',
                       display: 'flex',
                       flexDirection: 'column',
                       transition: 'transform 0.2s',
                       '&:hover': {
                         transform: 'translateY(-4px)',
                         boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                       }
                     }}
                   >
                     <CardContent sx={{ flexGrow: 1 }}>
                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                         <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                           {event.title}
                         </Typography>
                         <Box>
                           <Chip 
                             label={event.status} 
                             color={getStatusColor(event.status)}
                             size="small"
                             sx={{ mr: 1 }}
                           />
                           <Chip 
                             label={event.category} 
                             color={getCategoryColor(event.category)}
                             size="small"
                           />
                         </Box>
                       </Box>
                       
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                         {event.description.substring(0, 100)}...
                       </Typography>

                       <Box sx={{ mb: 2 }}>
                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                           <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                           <Typography variant="body2">
                             {formatDate(event.date)} at {event.time}
                           </Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                           <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                           <Typography variant="body2">{event.venue}</Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                           <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                           <Typography variant="body2">
                             {event.attendees?.length || 0}/{event.maxAttendees} attendees
                           </Typography>
                         </Box>
                       </Box>

                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Typography variant="body2" color="text.secondary">
                           Organizer: {event.organizer?.name || 'Unknown'}
                         </Typography>
                         <Box>
                           <IconButton
                             size="small"
                             onClick={() => {
                               setSelectedEvent(event);
                               setShareDialogOpen(true);
                             }}
                             color="secondary"
                           >
                             <Share />
                           </IconButton>
                         </Box>
                       </Box>
                     </CardContent>
                   </Card>
                 </Grid>
               ))
             )}
           </Grid>
         </>
       )}

       {activeTab === 2 && (
         <>
           {/* Budget & Expenses */}
           <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
             Budget & Expense Management
           </Typography>
           {events.length === 0 ? (
             <Box textAlign="center" py={4}>
               <AttachMoney sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                 Create events first to manage budgets and expenses
               </Typography>
               <Button
                 variant="contained"
                 startIcon={<Add />}
                 onClick={() => handleOpenDialog()}
               >
                 Create Your First Event
               </Button>
             </Box>
           ) : (
             <Grid container spacing={3}>
               {events.map((event) => (
                 <Grid item xs={12} md={6} lg={4} key={event._id}>
                   <Card>
                     <CardContent>
                       <Typography variant="h6" gutterBottom>
                         {event.title}
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                         {formatDate(event.date)} at {event.time}
                       </Typography>
                       <EventBudget 
                         eventId={event._id} 
                         isOrganizer={true}
                       />
                     </CardContent>
                   </Card>
                 </Grid>
               ))}
             </Grid>
           )}
         </>
       )}

       {activeTab === 3 && (
         <>
           {/* Live Event Updates */}
           <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
             Live Event Updates Management
           </Typography>
           {events.length === 0 ? (
             <Box textAlign="center" py={4}>
               <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                 Create events first to post live updates
               </Typography>
               <Button
                 variant="contained"
                 startIcon={<Add />}
                 onClick={() => handleOpenDialog()}
               >
                 Create Your First Event
               </Button>
             </Box>
           ) : (
             <Grid container spacing={3}>
               {events.map((event) => (
                 <Grid item xs={12} md={6} lg={4} key={event._id}>
                   <Card>
                     <CardContent>
                       <Typography variant="h6" gutterBottom>
                         {event.title}
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                         {formatDate(event.date)} at {event.time}
                       </Typography>
                       <LiveEventUpdates 
                         eventId={event._id} 
                         isOrganizer={true}
                       />
                     </CardContent>
                   </Card>
                 </Grid>
               ))}
             </Grid>
           )}
         </>
       )}

       {activeTab === 4 && (
         <>
           {/* Certificate Generation */}
           <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
             Certificate Generation Management
           </Typography>
           {events.length === 0 ? (
             <Box textAlign="center" py={4}>
               <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                 Create events first to generate certificates
               </Typography>
               <Button
                 variant="contained"
                 startIcon={<Add />}
                 onClick={() => handleOpenDialog()}
               >
                 Create Your First Event
               </Button>
             </Box>
           ) : (
             <Grid container spacing={3}>
               {events.map((event) => (
                 <Grid item xs={12} md={6} lg={4} key={event._id}>
                   <Card>
                     <CardContent>
                       <Typography variant="h6" gutterBottom>
                         {event.title}
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                         {formatDate(event.date)} at {event.time}
                       </Typography>
                     </CardContent>
                   </Card>
                 </Grid>
               ))}
             </Grid>
           )}
         </>
       )}
       
               {activeTab === 5 && (
          <ResourceManager />
        )}
        
        {activeTab === 6 && (
          <EventClashDetector />
        )}

      {/* Create/Edit Event Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Basic Info" />
              <Tab label="Advanced" />
              <Tab label="Resources" />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    required
                    disabled={formData.eventType === 'online'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={formData.eventType}
                      label="Event Type"
                      onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                    >
                      <MenuItem value="offline">Offline</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {formData.eventType === 'online' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Platform</InputLabel>
                        <Select
                          value={formData.onlineMeetingPlatform}
                          label="Platform"
                          onChange={(e) => setFormData({...formData, onlineMeetingPlatform: e.target.value})}
                        >
                          <MenuItem value="zoom">Zoom</MenuItem>
                          <MenuItem value="teams">Microsoft Teams</MenuItem>
                          <MenuItem value="meet">Google Meet</MenuItem>
                          <MenuItem value="webex">Cisco Webex</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Meeting Link"
                        value={formData.onlineMeetingLink}
                        onChange={(e) => setFormData({...formData, onlineMeetingLink: e.target.value})}
                        placeholder="https://..."
                        required
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Attendees"
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({...formData, maxAttendees: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <MenuItem value="academic">Academic</MenuItem>
                      <MenuItem value="cultural">Cultural</MenuItem>
                      <MenuItem value="sports">Sports</MenuItem>
                      <MenuItem value="technical">Technical</MenuItem>
                      <MenuItem value="social">Social</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Registration Deadline"
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tags (comma-separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="e.g., workshop, networking, free"
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPaid}
                        onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                      />
                    }
                    label="Paid Event"
                  />
                </Grid>
                
                {formData.isPaid && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Ticket Pricing
                      </Typography>
                    </Grid>
                    {formData.ticketPricing.map((ticket, index) => (
                      <React.Fragment key={index}>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={ticket.type}
                              label="Type"
                              onChange={(e) => {
                                const newPricing = [...formData.ticketPricing];
                                newPricing[index].type = e.target.value;
                                setFormData({...formData, ticketPricing: newPricing});
                              }}
                            >
                              <MenuItem value="regular">Regular</MenuItem>
                              <MenuItem value="student">Student</MenuItem>
                              <MenuItem value="early_bird">Early Bird</MenuItem>
                              <MenuItem value="vip">VIP</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={ticket.price}
                            onChange={(e) => {
                              const newPricing = [...formData.ticketPricing];
                              newPricing[index].price = e.target.value;
                              setFormData({...formData, ticketPricing: newPricing});
                            }}
                            InputProps={{ startAdornment: '$' }}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Available"
                            type="number"
                            value={ticket.available}
                            onChange={(e) => {
                              const newPricing = [...formData.ticketPricing];
                              newPricing[index].available = e.target.value;
                              setFormData({...formData, ticketPricing: newPricing});
                            }}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <IconButton
                            color="error"
                            onClick={() => {
                              const newPricing = formData.ticketPricing.filter((_, i) => i !== index);
                              setFormData({...formData, ticketPricing: newPricing});
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </React.Fragment>
                    ))}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            ticketPricing: [...formData.ticketPricing, { type: 'regular', price: '', available: '' }]
                          });
                        }}
                      >
                        Add Ticket Type
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={formData.currency}
                          label="Currency"
                          onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        >
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="GBP">GBP</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                      />
                    }
                    label="Recurring Event"
                  />
                </Grid>

                {formData.isRecurring && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Recurrence Pattern</InputLabel>
                        <Select
                          value={formData.recurrence.pattern}
                          label="Recurrence Pattern"
                          onChange={(e) => setFormData({
                            ...formData, 
                            recurrence: {...formData.recurrence, pattern: e.target.value}
                          })}
                        >
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="yearly">Yearly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Interval"
                        type="number"
                        value={formData.recurrence.interval}
                        onChange={(e) => setFormData({
                          ...formData, 
                          recurrence: {...formData.recurrence, interval: parseInt(e.target.value)}
                        })}
                        helperText="Every X days/weeks/months/years"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={formData.recurrence.endDate}
                        onChange={(e) => setFormData({
                          ...formData, 
                          recurrence: {...formData.recurrence, endDate: e.target.value}
                        })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {activeTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Resources</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addResource}
                      size="small"
                    >
                      Add Resource
                    </Button>
                  </Box>
                  
                  {formData.resources.map((resource, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <TextField
                        label="Resource Name"
                        value={resource.name}
                        onChange={(e) => updateResource(index, 'name', e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1 }}
                      />
                      <TextField
                        label="Quantity"
                        type="number"
                        value={resource.quantity}
                        onChange={(e) => updateResource(index, 'quantity', parseInt(e.target.value))}
                        size="small"
                        sx={{ width: 100 }}
                      />
                      <TextField
                        label="Cost"
                        type="number"
                        value={resource.cost}
                        onChange={(e) => updateResource(index, 'cost', parseFloat(e.target.value))}
                        size="small"
                        sx={{ width: 100 }}
                        InputProps={{ startAdornment: '$' }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => removeResource(index)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
          >
            {editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Share Dialog */}
      <EventShare
        event={selectedEvent}
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />
    </Container>
  );
};

export default OrganizerDashboard; 