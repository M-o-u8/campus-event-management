import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  Event,
  LocationOn,
  Schedule,
  People,
  Category,
  Share
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import EventShare from '../common/EventShare';
import EventFeedback from '../common/EventFeedback';
import QRCodeGenerator from '../common/QRCodeGenerator';
import EventCalendar from '../common/EventCalendar';
import GoogleMaps from '../common/GoogleMaps';
import EventRegistration from '../common/EventRegistration';
import GamificationDashboard from './GamificationDashboard';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventsPerPage] = useState(6);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [selectedEventForQR, setSelectedEventForQR] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchEvents();
    }
  }, [page, searchTerm, selectedCategory, startDate, endDate, location, sortBy, sortOrder]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit: eventsPerPage,
        status: 'approved',
        sortBy,
        sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      if (location) {
        params.location = location;
      }

      const response = await axios.get('/api/events', { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle new API response format with pagination
      if (response.data.pagination) {
        setEvents(response.data.events);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        // Fallback for old format
        setEvents(response.data);
        setTotalPages(Math.ceil(response.data.length / eventsPerPage));
      }
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if user is already registered
      const currentEvent = events.find(e => e._id === eventId);
      const isUserRegistered = isRegistered(currentEvent);
      
      if (isUserRegistered) {
        addNotification('You are already registered for this event', 'error');
        return;
      }
      
      // Make registration API call
      const response = await axios.post(`/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the local state to add the user to attendees
      setEvents(prevEvents => {
        const newEvents = prevEvents.map(event => {
          if (event._id === eventId) {
            // Use the backend response data directly instead of creating our own attendee
            const newAttendee = {
              user: response.data.attendee?.user || currentUser.id || currentUser._id,
              status: response.data.attendee?.status || 'registered',
              registrationDate: response.data.attendee?.registrationDate || new Date().toISOString(),
              ticketId: response.data.attendee?.ticketId || `TICKET-${Date.now()}`,
              waitlistPosition: response.data.attendee?.waitlistPosition || null,
              paymentStatus: response.data.attendee?.paymentStatus || 'completed'
            };
            
            const updatedEvent = {
              ...event,
              attendees: [...(event.attendees || []), newAttendee]
            };
            
            return updatedEvent;
          }
          return event;
        });
        
        return newEvents;
      });
      
      // Add appropriate notification
      if (response.data.isWaitlisted) {
        addNotification(`Added to waitlist for ${currentEvent.title}! Position: ${response.data.waitlistPosition}`, 'warning');
      } else {
        addNotification(`Successfully registered for ${currentEvent.title}!`, 'success');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register for event');
      addNotification(error.response?.data?.message || 'Failed to register for event', 'error');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if user is actually registered
      const currentEvent = events.find(e => e._id === eventId);
      const isUserRegistered = isRegistered(currentEvent);
      
      if (!isUserRegistered) {
        addNotification('You are not registered for this event', 'error');
        return;
      }
      
      // Make unregistration API call
      const response = await axios.delete(`http://localhost:5000/api/events/${eventId}/unregister`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the local state to remove the user from attendees
      setEvents(prevEvents => {
        const newEvents = prevEvents.map(event => {
          if (event._id === eventId) {
            // Handle both id and _id formats from backend
            const currentUserId = currentUser.id?.toString() || currentUser._id?.toString();
            
            if (!currentUserId) {
              console.error('No valid user ID found for unregistration');
              return event;
            }
            
            const filteredAttendees = event.attendees.filter(attendee => {
              const attendeeUserId = attendee.user?.toString();
              return attendeeUserId !== currentUserId;
            });
            
            const updatedEvent = {
              ...event,
              attendees: filteredAttendees
            };
            
            return updatedEvent;
          }
          return event;
        });
        
        return newEvents;
      });
      
      addNotification('Successfully unregistered from the event!', 'success');
      
    } catch (error) {
      console.error('Unregistration error:', error);
      setError(error.response?.data?.message || 'Failed to unregister from event');
      addNotification(error.response?.data?.message || 'Failed to unregister from event', 'error');
    }
  };

  const isRegistered = (event) => {
    if (!event.attendees || !currentUser) {
      return false;
    }
    
    // Handle both id and _id formats from backend
    const currentUserId = currentUser.id?.toString() || currentUser._id?.toString();
    
    if (!currentUserId) {
      return false;
    }
    
    // Check if user exists in attendees array
    const userRegistration = event.attendees.find(attendee => {
      const attendeeUserId = attendee.user?.toString();
      return attendeeUserId === currentUserId;
    });
    
    const isUserRegistered = userRegistration && (userRegistration.status === 'registered' || userRegistration.status === 'waitlisted');
    
    // Return true if user is registered (either confirmed or waitlisted)
    return isUserRegistered;
  };

  const getUserRegistration = (event) => {
    if (!event.attendees || !currentUser) return null;
    
    // Handle both id and _id formats from backend
    const currentUserId = currentUser.id?.toString() || currentUser._id?.toString();
    
    if (!currentUserId) return null;
    
    // Find user's registration in attendees array
    return event.attendees.find(attendee => {
      const attendeeUserId = attendee.user?.toString();
      return attendeeUserId === currentUserId;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'primary',
      social: 'success',
      sports: 'warning',
      cultural: 'info',
      technical: 'secondary',
      workshop: 'error',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {currentUser.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover and register for exciting campus events
      </Typography>

      {/* Notifications Display */}
      {notifications.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity={notification.type || 'info'}
              sx={{ mb: 1 }}
              onClose={() => {
                const newNotifications = notifications.filter((_, i) => i !== index);
                setNotifications(newNotifications);
              }}
            >
              {notification.message}
            </Alert>
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

             {/* Tabs */}
       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
         <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
           <Tab label="All Events" />
           <Tab label="Calendar View" />
           <Tab label="My Tickets" />
           <Tab label="Registration Manager" />
           <Tab label="🏆 Gamification" />
         </Tabs>
       </Box>



             {/* Tab Content */}
       {activeTab === 0 && (
         <>
           {/* Search and Filter Section */}
           <Box sx={{ mb: 4 }}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={12} md={4}>
                 <TextField
                   fullWidth
                   placeholder="Search events..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   InputProps={{
                     startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                   }}
                 />
               </Grid>
               <Grid item xs={12} md={2}>
                 <FormControl fullWidth>
                   <InputLabel>Category</InputLabel>
                   <Select
                     value={selectedCategory}
                     onChange={(e) => setSelectedCategory(e.target.value)}
                     label="Category"
                   >
                     <MenuItem value="">All Categories</MenuItem>
                     <MenuItem value="academic">Academic</MenuItem>
                     <MenuItem value="social">Social</MenuItem>
                     <MenuItem value="sports">Sports</MenuItem>
                     <MenuItem value="cultural">Cultural</MenuItem>
                     <MenuItem value="technical">Technical</MenuItem>
                     <MenuItem value="workshop">Workshop</MenuItem>
                     <MenuItem value="other">Other</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} md={2}>
                 <TextField
                   fullWidth
                   type="date"
                   label="Start Date"
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   InputLabelProps={{ shrink: true }}
                 />
               </Grid>
               <Grid item xs={12} md={2}>
                 <TextField
                   fullWidth
                   type="date"
                   label="End Date"
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   InputLabelProps={{ shrink: true }}
                 />
               </Grid>
               <Grid item xs={12} md={2}>
                 <TextField
                   fullWidth
                   placeholder="Location..."
                   value={location}
                   onChange={(e) => setLocation(e.target.value)}
                   InputProps={{
                     startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                   }}
                 />
               </Grid>
             </Grid>
             
             {/* Second row for sorting and clear filters */}
             <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
               <Grid item xs={12} md={3}>
                 <FormControl fullWidth>
                   <InputLabel>Sort By</InputLabel>
                   <Select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     label="Sort By"
                   >
                     <MenuItem value="date">Date</MenuItem>
                     <MenuItem value="title">Title</MenuItem>
                     <MenuItem value="category">Category</MenuItem>
                     <MenuItem value="createdAt">Created</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} md={3}>
                 <FormControl fullWidth>
                   <InputLabel>Order</InputLabel>
                   <Select
                     value={sortOrder}
                     onChange={(e) => setSortOrder(e.target.value)}
                     label="Order"
                   >
                     <MenuItem value="asc">Ascending</MenuItem>
                     <MenuItem value="desc">Descending</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} md={3}>
                 <Button
                   fullWidth
                   variant="outlined"
                   onClick={() => {
                     setSearchTerm('');
                     setSelectedCategory('');
                     setStartDate('');
                     setEndDate('');
                     setLocation('');
                     setSortBy('date');
                     setSortOrder('asc');
                     setPage(1);
                   }}
                 >
                   Clear Filters
                 </Button>
               </Grid>
               <Grid item xs={12} md={3}>
                 <Button
                   fullWidth
                   variant="contained"
                   onClick={() => {
                     setPage(1);
                     fetchEvents();
                   }}
                 >
                   Apply Filters
                 </Button>
               </Grid>
             </Grid>
           </Box>

           {/* Events Grid */}
           <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card 
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={event.category}
                    color={getCategoryColor(event.category)}
                    size="small"
                  />
                  {event.isPaid && (
                    <Chip
                      label={`$${event.price}`}
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="h6" component="h2" gutterBottom>
                  {event.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {event.description.length > 100 
                    ? `${event.description.substring(0, 100)}...` 
                    : event.description
                  }
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(event.date)} at {formatTime(event.time)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.venue}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.attendees?.length || 0} / {event.maxAttendees} registered
                  </Typography>
                </Box>

                {/* Event Availability Status */}
                {!event.isAvailable && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={`Event Not Available: ${event.availabilityReason?.replace('_', ' ') || 'Unavailable'}`}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}

                {/* Waiting List Status */}
                {isRegistered(event) && (() => {
                  const registration = getUserRegistration(event);
                  
                  if (registration?.status === 'waitlisted') {
                    return (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={`On Waiting List - Position ${(registration.waitlistPosition || 0) + 1}`}
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    );
                  }
                  return null;
                })()}

                {/* Ticket Information for Paid Events */}
                {event.isPaid && event.ticketPricing && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Ticket Prices:
                    </Typography>
                    {event.ticketPricing.map((ticket, index) => (
                      <Chip
                        key={index}
                        label={`${ticket.type}: $${ticket.price}`}
                        color="warning"
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}

                {event.tags && event.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Registration Status Display */}
                  {(() => {
                    const registration = getUserRegistration(event);
                    if (registration) {
                      return (
                        <Chip
                          label={registration.status === 'waitlisted' ? 'Waitlisted' : 'Registered'}
                          color={registration.status === 'waitlisted' ? 'warning' : 'success'}
                          size="small"
                          variant="outlined"
                        />
                      );
                    }
                    return null;
                  })()}
                  
                  {isRegistered(event) ? (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleUnregister(event._id)}
                      size="small"
                    >
                      Unregister
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRegister(event._id)}
                      size="small"
                    >
                      Register
                    </Button>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Share />}
                    onClick={() => {
                      setSelectedEvent(event);
                      setShareDialogOpen(true);
                    }}
                  >
                    Share
                  </Button>
                  {isRegistered(event) && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedEventForFeedback(event);
                        setFeedbackDialogOpen(true);
                      }}
                    >
                      Feedback
                    </Button>
                  )}
                  
                  {/* QR Code and Calendar Export for registered users */}
                  {isRegistered(event) && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={() => {
                          setSelectedEventForQR(event);
                          setQrCodeDialogOpen(true);
                        }}
                      >
                        QR Code
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="info"
                        onClick={() => {
                          // Export to calendar
                          window.open(`http://localhost:5000/api/events/${event._id}/export-calendar`, '_blank');
                        }}
                      >
                        Add to Calendar
                      </Button>
                    </>
                  )}
                  
                  {/* Map View Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    onClick={() => {
                      setSelectedEvent(event);
                      setMapDialogOpen(true);
                    }}
                  >
                    View Map
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {events.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or check back later for new events.
          </Typography>
        </Box>
      )}
         </>
       )}

       {/* Calendar View Tab */}
       {activeTab === 1 && (
         <Box>
           <Typography variant="h6" gutterBottom>
             Calendar View
           </Typography>
           <Box sx={{ height: '600px', mb: 3 }}>
             <EventCalendar 
               events={events}
               onEventSelect={(event) => {
                 // Handle event selection - could open event details or scroll to event
               }}
               height={600}
             />
           </Box>
         </Box>
       )}

       {/* My Tickets Tab */}
       {activeTab === 2 && (
         <Box>
           <Typography variant="h6" gutterBottom>
             My Registered Events
           </Typography>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
             View and manage all your event registrations, including waitlist status and ticket information.
           </Typography>
           
           {/* Registration Statistics */}
           {(() => {
             const registeredEvents = events.filter(event => isRegistered(event));
             const confirmedEvents = registeredEvents.filter(event => {
               const registration = getUserRegistration(event);
               return registration?.status === 'registered';
             });
             const waitlistedEvents = registeredEvents.filter(event => {
               const registration = getUserRegistration(event);
               return registration?.status === 'waitlisted';
             });
             
             return (
               <Box sx={{ mb: 3 }}>
                 <Grid container spacing={2}>
                   <Grid item xs={12} sm={4}>
                     <Card sx={{ textAlign: 'center', p: 2 }}>
                       <Typography variant="h4" color="primary">
                         {registeredEvents.length}
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         Total Events
                       </Typography>
                     </Card>
                   </Grid>
                   <Grid item xs={12} sm={4}>
                     <Card sx={{ textAlign: 'center', p: 2 }}>
                       <Typography variant="h4" color="success.main">
                         {confirmedEvents.length}
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         Confirmed
                       </Typography>
                     </Card>
                   </Grid>
                   <Grid item xs={12} sm={4}>
                     <Card sx={{ textAlign: 'center', p: 2 }}>
                       <Typography variant="h4" color="warning.main">
                         {waitlistedEvents.length}
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         Waitlisted
                       </Typography>
                     </Card>
                   </Grid>
                 </Grid>
               </Box>
             );
           })()}
           
           {(() => {
             const registeredEvents = events.filter(event => isRegistered(event));
             return (
               <>
                 <Grid container spacing={3}>
                   {registeredEvents.map((event) => {
                     const registration = getUserRegistration(event);
                     
                     const isWaitlisted = registration?.status === 'waitlisted';
                     const isConfirmed = registration?.status === 'registered';
                     
                     return (
                       <Grid item xs={12} sm={6} md={4} key={event._id}>
                         <Card elevation={2}>
                           <CardContent>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                               <Chip
                                 label={event.category}
                                 color={getCategoryColor(event.category)}
                                 size="small"
                               />
                               <Chip
                                 label={isWaitlisted ? 'Waitlisted' : 'Confirmed'}
                                 color={isWaitlisted ? 'warning' : 'success'}
                                 size="small"
                                 variant="outlined"
                               />
                             </Box>
                             
                             <Typography variant="h6" gutterBottom>
                               {event.title}
                             </Typography>
                             
                             <Typography variant="body2" color="text.secondary" gutterBottom>
                               {formatDate(event.date)} at {formatTime(event.time)}
                             </Typography>
                             
                             <Typography variant="body2" color="text.secondary" gutterBottom>
                               Venue: {event.venue}
                             </Typography>
                             
                             <Typography variant="body2" color="text.secondary" gutterBottom>
                               Category: {event.category}
                             </Typography>
                             
                             {registration && (
                               <>
                                 <Typography variant="body2" color="text.secondary" gutterBottom>
                                   Registration Date: {registration.registrationDate ? formatDate(registration.registrationDate) : 'N/A'}
                                 </Typography>
                                 
                                 {registration.ticketId && (
                                   <Typography variant="body2" color="text.secondary" gutterBottom>
                                     Ticket ID: {registration.ticketId}
                                   </Typography>
                                 )}
                                 
                                 {isWaitlisted && registration.waitlistPosition && (
                                   <Typography variant="body2" color="text.secondary" gutterBottom>
                                     Waitlist Position: {registration.waitlistPosition}
                                   </Typography>
                                 )}
                                 
                                 <Typography variant="body2" color="text.secondary" gutterBottom>
                                   Payment Status: {registration.paymentStatus || 'N/A'}
                                 </Typography>
                                 
                                 {event.isPaid && (
                                   <Typography variant="body2" color="text.secondary" gutterBottom>
                                     Amount: ${registration.paymentAmount || 0}
                                   </Typography>
                                 )}
                               </>
                             )}
                             
                             {/* Event Status Information */}
                             <Box sx={{ mt: 2 }}>
                               <Typography variant="caption" color="text.secondary" display="block">
                                 Event Status: {event.status}
                               </Typography>
                               <Typography variant="caption" color="text.secondary" display="block">
                                 Capacity: {event.attendees?.filter(a => a.status === 'registered').length || 0} / {event.maxAttendees}
                               </Typography>
                               {event.attendees?.filter(a => a.status === 'waitlisted').length > 0 && (
                                 <Typography variant="caption" color="text.secondary" display="block">
                                   Waitlist: {event.attendees.filter(a => a.status === 'waitlisted').length} people
                                 </Typography>
                               )}
                             </Box>
                           </CardContent>
                           
                           <CardActions>
                             <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                               {/* QR Code Button */}
                               <Button
                                 variant="outlined"
                                 size="small"
                                 color="primary"
                                 onClick={() => {
                                   setSelectedEventForQR(event);
                                   setQrCodeDialogOpen(true);
                                 }}
                               >
                                 QR Code
                               </Button>
                               
                               {/* Calendar Export */}
                               <Button
                                 variant="outlined"
                                 size="small"
                                 color="info"
                                 onClick={() => {
                                   window.open(`http://localhost:5000/api/events/${event._id}/export-calendar`, '_blank');
                                 }}
                               >
                                 Add to Calendar
                               </Button>
                               
                               {/* Feedback Button */}
                               <Button
                                 variant="outlined"
                                 size="small"
                                 color="secondary"
                                 onClick={() => {
                                   setSelectedEventForFeedback(event);
                                   setFeedbackDialogOpen(true);
                                 }}
                               >
                                 Feedback
                               </Button>
                               
                               {/* Unregister Button */}
                               <Button
                                 variant="outlined"
                                 size="small"
                                 color="error"
                                 onClick={() => handleUnregister(event._id)}
                               >
                                 Unregister
                               </Button>
                             </Box>
                           </CardActions>
                         </Card>
                       </Grid>
                     );
                   })}
                 </Grid>
                 
                 {registeredEvents.length === 0 && (
                   <Box sx={{ textAlign: 'center', mt: 4 }}>
                     <Typography variant="h6" color="text.secondary" gutterBottom>
                       No events registered yet
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       Browse events and register to see them here.
                     </Typography>
                   </Box>
                 )}
               </>
             );
           })()}
         </Box>
       )}

       {/* Registration Manager Tab */}
       {activeTab === 3 && (
         <Box>
           <Typography variant="h6" gutterBottom>
             Enhanced Registration Management
           </Typography>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
             Manage your event registrations with advanced features including eligibility checking, 
             waitlist management, and QR code generation.
           </Typography>
           
           <Grid container spacing={3}>
             {events.filter(event => event.status === 'approved').map((event) => (
               <Grid item xs={12} md={6} key={event._id}>
                 <Card elevation={2}>
                   <CardContent>
                     <Typography variant="h6" gutterBottom>
                       {event.title}
                     </Typography>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                       {formatDate(event.date)} at {formatTime(event.time)}
                     </Typography>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                       Venue: {event.venue}
                     </Typography>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                       Category: {event.category}
                     </Typography>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                       <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                       <Typography variant="body2" color="text.secondary">
                         {event.attendees?.filter(a => a.status === 'registered').length || 0} / {event.maxAttendees} registered
                       </Typography>
                     </Box>
                     {event.isPaid && (
                       <Chip
                         label={`$${event.price} ${event.currency || ''}`}
                         color="warning"
                         size="small"
                         variant="outlined"
                         sx={{ mb: 2 }}
                       />
                     )}
                   </CardContent>
                   <CardActions>
                     <EventRegistration
                       event={event}
                       onRegistrationUpdate={(data) => {
                         if (data.success) {
                           // Update the event data to include the new registration
                           const updatedEvent = {
                             ...event,
                             attendees: [
                               ...(event.attendees || []),
                               {
                                 user: currentUser.id || currentUser._id,
                                 status: data.attendee.status,
                                 registrationDate: data.attendee.registrationDate,
                                 ticketId: data.attendee.ticketId,
                                 waitlistPosition: data.attendee.waitlistPosition,
                                 paymentStatus: data.attendee.paymentStatus
                               }
                             ]
                           };
                           
                           // Update the events array with the modified event
                           setEvents(prevEvents => 
                             prevEvents.map(e => 
                               e._id === event._id ? updatedEvent : e
                             )
                           );
                           
                           // Add appropriate notification
                           if (data.isWaitlisted) {
                             addNotification(`Added to waitlist for ${event.title}! Position: ${data.waitlistPosition}`, 'warning');
                           } else {
                             addNotification(`Successfully registered for ${event.title}!`, 'success');
                           }
                         }
                       }}
                     />
                   </CardActions>
                 </Card>
               </Grid>
             ))}
           </Grid>
           
           {events.filter(event => event.status === 'approved').length === 0 && (
             <Box sx={{ textAlign: 'center', mt: 4 }}>
               <Typography variant="h6" color="text.secondary" gutterBottom>
                 No approved events available
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 Check back later for new events or contact an organizer.
               </Typography>
             </Box>
           )}
         </Box>
       )}

       {/* Gamification Tab */}
       {activeTab === 4 && (
         <Box>
           <GamificationDashboard />
         </Box>
       )}

             {/* Event Share Dialog */}
       <EventShare
         event={selectedEvent}
         open={shareDialogOpen}
         onClose={() => setShareDialogOpen(false)}
       />

       {/* Event Feedback Dialog */}
       <EventFeedback
         event={selectedEventForFeedback}
         open={feedbackDialogOpen}
         onClose={() => setFeedbackDialogOpen(false)}
         onFeedbackSubmitted={() => {
           fetchEvents();
         }}
       />

       {/* QR Code Generator Dialog */}
       <QRCodeGenerator
         eventId={selectedEventForQR?._id}
         userId={currentUser?.id || currentUser?._id}
         open={qrCodeDialogOpen}
         onClose={() => setQrCodeDialogOpen(false)}
       />

       {/* Google Maps Dialog */}
       <GoogleMaps
         venue={selectedEvent?.venue}
         open={mapDialogOpen}
         onClose={() => setMapDialogOpen(false)}
       />
    </Container>
  );
};

export default StudentDashboard; 