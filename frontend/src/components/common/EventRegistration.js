import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Event,
  CheckCircle,
  Cancel,
  Warning,
  Schedule,
  People,
  Payment,
  AccessTime,
  LocationOn,
  Person,
  Info,
  QrCode,
  Download
} from '@mui/icons-material';
import axios from 'axios';
import QRCodeGenerator from './QRCodeGenerator';

const EventRegistration = ({ event, onRegistrationUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);

  // Get current user from localStorage token
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (event) {
      checkEligibility();
      checkRegistrationStatus();
    }
  }, [event]);

  const checkEligibility = async () => {
    if (!event) return;
    
    setEligibilityLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/events/${event._id}/eligibility`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setEligibility(response.data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setError('Failed to check eligibility');
    } finally {
      setEligibilityLoading(false);
    }
  };

  const checkRegistrationStatus = () => {
    if (!event || !eligibility) return;

    const userAttendee = event.attendees?.find(attendee => 
      attendee.user === getCurrentUserId() || 
      attendee.user._id === getCurrentUserId()
    );

    if (userAttendee) {
      setRegistrationStatus({
        status: userAttendee.status,
        registrationDate: userAttendee.registrationDate,
        ticketId: userAttendee.ticketId,
        waitlistPosition: userAttendee.waitlistPosition,
        paymentStatus: userAttendee.paymentStatus
      });
    }
  };

  const handleRegister = async () => {
    if (!event || !eligibility?.isEligible) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/events/${event._id}/register`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setRegistrationStatus({
          status: response.data.attendee.status,
          registrationDate: response.data.attendee.registrationDate,
          ticketId: response.data.attendee.ticketId,
          waitlistPosition: response.data.attendee.waitlistPosition,
          paymentStatus: response.data.attendee.paymentStatus
        });

        // Update eligibility
        await checkEligibility();

        // Notify parent component
        if (onRegistrationUpdate) {
          onRegistrationUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      setError(error.response?.data?.message || 'Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/events/${event._id}/unregister`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Successfully unregistered from event');
        setRegistrationStatus(null);
        
        // Update eligibility
        await checkEligibility();

        // Notify parent component
        if (onRegistrationUpdate) {
          onRegistrationUpdate({ type: 'unregistered' });
        }
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      setError(error.response?.data?.message || 'Failed to unregister from event');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered': return 'success';
      case 'waitlisted': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered': return <CheckCircle />;
      case 'waitlisted': return <Warning />;
      case 'cancelled': return <Cancel />;
      default: return <Info />;
    }
  };

  const renderEligibilityDetails = () => {
    if (!eligibility) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Registration Eligibility
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  {eligibility.eligibilityChecks.eventApproved ? <CheckCircle color="success" /> : <Cancel color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Event Approved" 
                  secondary={eligibility.eligibilityChecks.eventApproved ? 'Yes' : 'No'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {eligibility.eligibilityChecks.eventAvailable ? <CheckCircle color="success" /> : <Cancel color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Event Available" 
                  secondary={eligibility.eligibilityChecks.eventAvailable ? 'Yes' : 'No'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {!eligibility.eligibilityChecks.registrationDeadline.passed ? <CheckCircle color="success" /> : <Cancel color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Registration Deadline" 
                  secondary={eligibility.eligibilityChecks.registrationDeadline.passed 
                    ? 'Passed' 
                    : `Closes in ${eligibility.eligibilityChecks.registrationDeadline.timeRemaining}`
                  }
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  {eligibility.eligibilityChecks.userRole.eligible ? <CheckCircle color="success" /> : <Cancel color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary="User Role" 
                  secondary={eligibility.eligibilityChecks.userRole.eligible ? 'Student' : 'Not eligible'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {!eligibility.eligibilityChecks.alreadyRegistered.registered ? <CheckCircle color="success" /> : <Cancel color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Already Registered" 
                  secondary={eligibility.eligibilityChecks.alreadyRegistered.registered ? 'Yes' : 'No'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {!eligibility.eligibilityChecks.timeConflict.hasConflict ? <CheckCircle color="success" /> : <Cancel color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Time Conflicts" 
                  secondary={eligibility.eligibilityChecks.timeConflict.hasConflict ? 'Has conflicts' : 'No conflicts'}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {eligibility.eligibilityChecks.timeConflict.hasConflict && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Time Conflicts Detected:
            </Typography>
            <List dense>
              {eligibility.eligibilityChecks.timeConflict.conflictingEvents.map((conflict, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText
                    primary={conflict.title}
                    secondary={`${new Date(conflict.date).toLocaleDateString()} at ${conflict.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {eligibility.eligibilityChecks.payment.required && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Payment Required: ${eligibility.eligibilityChecks.payment.amount}
            </Typography>
            <Typography variant="body2">
              Your balance: ${eligibility.eligibilityChecks.payment.userBalance}
              {!eligibility.eligibilityChecks.payment.sufficient && (
                <span style={{ color: 'red' }}> - Insufficient balance</span>
              )}
            </Typography>
          </Alert>
        )}
      </Box>
    );
  };

  const renderRegistrationStatus = () => {
    if (!registrationStatus) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Registration Status
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Chip
                  icon={getStatusIcon(registrationStatus.status)}
                  label={registrationStatus.status.charAt(0).toUpperCase() + registrationStatus.status.slice(1)}
                  color={getStatusColor(registrationStatus.status)}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs>
                <Typography variant="body2" color="text.secondary">
                  Registered on: {new Date(registrationStatus.registrationDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ticket ID: {registrationStatus.ticketId}
                </Typography>
                {registrationStatus.waitlistPosition && (
                  <Typography variant="body2" color="text.secondary">
                    Waitlist Position: {registrationStatus.waitlistPosition}
                  </Typography>
                )}
                {registrationStatus.paymentStatus && (
                  <Typography variant="body2" color="text.secondary">
                    Payment: {registrationStatus.paymentStatus}
                  </Typography>
                )}
              </Grid>
              
              <Grid item>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View QR Code">
                    <IconButton 
                      onClick={() => setShowQRDialog(true)}
                      color="primary"
                    >
                      <QrCode />
                    </IconButton>
                  </Tooltip>
                  
                  {eligibility?.eligibilityChecks?.registrationDeadline?.passed === false && (
                    <Tooltip title="Cancel Registration">
                      <IconButton 
                        onClick={handleUnregister}
                        color="error"
                        disabled={loading}
                      >
                        <Cancel />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderActionButtons = () => {
    if (registrationStatus) return null;

    if (eligibilityLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 1 }}>Checking eligibility...</Typography>
        </Box>
      );
    }

    if (!eligibility?.isEligible) {
      return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowEligibilityDialog(true)}
            startIcon={<Info />}
          >
            View Eligibility Details
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Button
          variant="contained"
          onClick={handleRegister}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Event />}
          size="large"
        >
          {loading ? 'Registering...' : 'Register for Event'}
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {eligibility.eligibilityChecks.seatAvailability.availableSeats} seats available
        </Typography>
      </Box>
    );
  };

  if (!event) return null;

  return (
    <Box>
      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Event Information */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {event.title}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{event.venue}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {event.attendees?.filter(a => a.status === 'registered').length || 0} / {event.maxAttendees} registered
                </Typography>
              </Box>
              
              {event.isPaid && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Payment sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    ${event.price} {event.currency}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Registration Status */}
      {renderRegistrationStatus()}

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Eligibility Dialog */}
      <Dialog 
        open={showEligibilityDialog} 
        onClose={() => setShowEligibilityDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            Registration Eligibility Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderEligibilityDetails()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEligibilityDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog 
        open={showQRDialog} 
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode color="primary" />
            Event Ticket QR Code
          </Box>
        </DialogTitle>
        <DialogContent>
          <QRCodeGenerator
            eventId={event._id}
            userId={getCurrentUserId()}
            open={showQRDialog}
            onClose={() => setShowQRDialog(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventRegistration;
