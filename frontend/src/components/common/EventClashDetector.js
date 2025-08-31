import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Download
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const EventClashDetector = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load quick availability on component mount and auto-refresh
  useEffect(() => {
    if (currentUser) {
      loadAllQuickAvailability();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        loadAllQuickAvailability();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);
  
  // Form data for clash detection
  const [clashForm, setClashForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 2,
    venue: '',
    eventId: '' // For editing existing events
  });
  
  // Clash detection results
  const [clashResults, setClashResults] = useState(null);
  const [showClashDialog, setShowClashDialog] = useState(false);
  
  // Available venues (hardcoded for now, could be fetched from API)
  const venues = [
    'Main Auditorium',
    'Conference Room A',
    'Conference Room B',
    'Seminar Hall 1',
    'Seminar Hall 2',
    'Open Air Amphitheater'
  ];

  // Quick availability state
  const [quickAvailability, setQuickAvailability] = useState({});
  const [quickAvailabilityLoading, setQuickAvailabilityLoading] = useState(false);

  const handleClashCheck = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (!clashForm.date || !clashForm.time || !clashForm.venue) {
        setError('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to check for clashes. Please log in first.');
        return;
      }

      console.log('Checking for clashes with token:', token ? 'Token exists' : 'No token');
      console.log('Form data:', clashForm);

      const response = await axios.post('http://localhost:5000/api/events/check-clashes', clashForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Clash check response:', response.data);
      setClashResults(response.data);
      setShowClashDialog(true);
      
      if (response.data.available) {
        setSuccess('No conflicts detected! This time slot is available.');
      } else {
        setSuccess('Conflicts detected. Please review the details below.');
      }
      
    } catch (error) {
      console.error('Error checking for clashes:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid request data');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Failed to check for clashes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = (venue, date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setClashForm({
      ...clashForm,
      venue: venue,
      date: date === 'today' ? today.toISOString().split('T')[0] : tomorrow.toISOString().split('T')[0],
      time: '14:00',
      duration: 2
    });
    
    // Also check quick availability
    checkQuickAvailability(venue, date);
  };

  const checkQuickAvailability = async (venue, date) => {
    try {
      setQuickAvailabilityLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to check availability');
        return;
      }

      const checkDate = date === 'today' ? new Date() : new Date(new Date().setDate(new Date().getDate() + 1));
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const response = await axios.post('http://localhost:5000/api/events/check-clashes', {
        date: dateStr,
        time: '14:00',
        duration: 2,
        venue: venue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQuickAvailability(prev => ({
        ...prev,
        [`${venue}-${date}`]: {
          available: response.data.available,
          status: response.data.available ? 'Available' : 'Conflicts',
          conflicts: response.data.conflicts || []
        }
      }));
      
    } catch (error) {
      console.error('Quick availability check error:', error);
      setQuickAvailability(prev => ({
        ...prev,
        [`${venue}-${date}`]: {
          available: false,
          status: 'Error',
          conflicts: []
        }
      }));
    } finally {
      setQuickAvailabilityLoading(false);
    }
  };

  const loadAllQuickAvailability = async () => {
    try {
      setQuickAvailabilityLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const promises = venues.map(venue => [
        checkQuickAvailability(venue, 'today'),
        checkQuickAvailability(venue, 'tomorrow')
      ]).flat();
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading quick availability:', error);
    } finally {
      setQuickAvailabilityLoading(false);
    }
  };

  const getConflictSeverity = (conflict) => {
    // Calculate conflict severity based on time overlap
    const eventStart = new Date(conflict.date + 'T' + conflict.time);
    const eventEnd = new Date(eventStart.getTime() + (conflict.duration || 2) * 60 * 60 * 1000);
    
    const requestedStart = new Date(clashForm.date + 'T' + clashForm.time);
    const requestedEnd = new Date(requestedStart.getTime() + clashForm.duration * 60 * 60 * 1000);
    
    const overlapStart = new Date(Math.max(eventStart, requestedStart));
    const overlapEnd = new Date(Math.min(eventEnd, requestedEnd));
    const overlapHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
    
    if (overlapHours >= 1) return 'high';
    if (overlapHours >= 0.5) return 'medium';
    return 'low';
  };

  const getConflictColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getConflictIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        ⚠️ Event Clash Detector
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Check for potential conflicts before scheduling your event. This tool helps prevent double-booking
        and ensures smooth event coordination across campus.
      </Typography>

      {/* System Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Current time: {new Date().toLocaleString()}
        </Typography>
        <Chip
          label={quickAvailabilityLoading ? 'Refreshing...' : 'System Online'}
          color={quickAvailabilityLoading ? 'warning' : 'success'}
          size="small"
          icon={quickAvailabilityLoading ? <CircularProgress size={16} /> : <CheckIcon />}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setError('');
                if (error.includes('Server error')) {
                  // Retry the last operation
                  if (Object.keys(quickAvailability).length > 0) {
                    loadAllQuickAvailability();
                  }
                }
              }}
            >
              Retry
            </Button>
          </Box>
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Main Clash Detection Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Check Event Availability
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={clashForm.date}
                onChange={(e) => setClashForm({ ...clashForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={clashForm.time}
                onChange={(e) => setClashForm({ ...clashForm, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Duration (hours)"
                type="number"
                value={clashForm.duration}
                onChange={(e) => setClashForm({ ...clashForm, duration: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 24 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select
                  value={clashForm.venue}
                  onChange={(e) => setClashForm({ ...clashForm, venue: e.target.value })}
                  label="Venue"
                  required
                >
                  <MenuItem value="">Select a venue</MenuItem>
                  {venues.map((venue) => (
                    <MenuItem key={venue} value={venue}>
                      {venue}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleClashCheck}
                disabled={loading || !clashForm.date || !clashForm.time || !clashForm.venue}
                sx={{ height: '56px' }}
              >
                {loading ? <LinearProgress /> : 'Check'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Check Options */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Availability Check
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={loadAllQuickAvailability}
                disabled={quickAvailabilityLoading}
                startIcon={quickAvailabilityLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const data = {
                    timestamp: new Date().toISOString(),
                    availability: quickAvailability,
                    venues: venues
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `venue-availability-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                startIcon={<Download />}
                disabled={Object.keys(quickAvailability).length === 0}
              >
                Export
              </Button>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Check availability for common venues on today or tomorrow
          </Typography>
          
          <Grid container spacing={2}>
            {venues.map((venue) => (
              <Grid item xs={12} sm={6} md={4} key={venue}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={quickAvailability[`${venue}-today`]?.available ? "contained" : "outlined"}
                    color={quickAvailability[`${venue}-today`]?.available ? "success" : "default"}
                    size="small"
                    onClick={() => handleQuickCheck(venue, 'today')}
                    startIcon={<ScheduleIcon />}
                    fullWidth
                    sx={{ 
                      position: 'relative',
                      '&::after': quickAvailability[`${venue}-today`]?.status === 'Available' ? {
                        content: '""',
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'success.main'
                      } : {}
                    }}
                  >
                    {venue} - Today
                  </Button>
                  <Button
                    variant={quickAvailability[`${venue}-tomorrow`]?.available ? "contained" : "outlined"}
                    color={quickAvailability[`${venue}-tomorrow`]?.available ? "success" : "default"}
                    size="small"
                    onClick={() => handleQuickCheck(venue, 'tomorrow')}
                    startIcon={<ScheduleIcon />}
                    fullWidth
                    sx={{ 
                      position: 'relative',
                      '&::after': quickAvailability[`${venue}-tomorrow`]?.status === 'Available' ? {
                        content: '""',
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'success.main'
                      } : {}
                    }}
                  >
                    {venue} - Tomorrow
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          {/* Quick Status Summary */}
          {Object.keys(quickAvailability).length > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Status Summary:
              </Typography>
              <Grid container spacing={1}>
                {venues.map((venue) => (
                  <Grid item xs={12} sm={6} md={4} key={venue}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        {venue}:
                      </Typography>
                      <Chip
                        size="small"
                        label={quickAvailability[`${venue}-today`]?.status || 'Unknown'}
                        color={quickAvailability[`${venue}-today`]?.available ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <Typography variant="body2" sx={{ mx: 1 }}>/</Typography>
                      <Chip
                        size="small"
                        label={quickAvailability[`${venue}-tomorrow`]?.status || 'Unknown'}
                        color={quickAvailability[`${venue}-tomorrow`]?.available ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Event Button - appears after successful availability check */}
      {success && success.includes('Time slot confirmed') && (
        <Card sx={{ mb: 4, bgcolor: 'success.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" color="success.dark" gutterBottom>
                  🎉 Time Slot Confirmed!
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Venue: {clashForm.venue} | Date: {clashForm.date} | Time: {formatTime(clashForm.time)} | Duration: {clashForm.duration} hours
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<EventIcon />}
                onClick={() => {
                  // Here you would typically navigate to event creation form
                  // For now, we'll show a success message
                  setSuccess('Event creation form would open here with pre-filled details!');
                }}
              >
                Create Event Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Clash Detection Results Dialog */}
      <Dialog 
        open={showClashDialog} 
        onClose={() => setShowClashDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {clashResults?.available ? (
              <>
                <CheckIcon color="success" />
                <Typography>No Conflicts Detected</Typography>
              </>
            ) : (
              <>
                <WarningIcon color="error" />
                <Typography>Conflicts Detected</Typography>
              </>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {clashResults && (
            <Box>
              {/* Summary */}
              <Alert 
                severity={clashResults.available ? 'success' : 'error'} 
                sx={{ mb: 3 }}
              >
                <Typography variant="h6" gutterBottom>
                  {clashResults.message}
                </Typography>
                <Typography variant="body2">
                  <strong>Venue:</strong> {clashResults.venue} | 
                  <strong> Date:</strong> {new Date(clashResults.date).toLocaleDateString()} | 
                  <strong> Time:</strong> {formatTime(clashForm.time)} | 
                  <strong> Duration:</strong> {formatDuration(clashForm.duration)}
                </Typography>
              </Alert>

              {clashResults.available ? (
                /* Available - Show suggested slots */
                <Box>
                  <Typography variant="h6" gutterBottom>
                    ✅ This time slot is available!
                  </Typography>
                  
                  {clashResults.suggestedSlots && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Other available time slots on the same day:
                      </Typography>
                      <Grid container spacing={1}>
                        {clashResults.suggestedSlots.map((slot, index) => (
                          <Grid item key={index}>
                            <Chip
                              label={slot}
                              color="success"
                              variant="outlined"
                              icon={<CheckIcon />}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              ) : (
                /* Conflicts detected */
                <Box>
                  <Typography variant="h6" gutterBottom color="error">
                    ❌ Conflicts detected with existing events
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The following events conflict with your requested time slot:
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Event</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Organizer</TableCell>
                          <TableCell>Conflict Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clashResults.conflicts.map((conflict, index) => {
                          const severity = getConflictSeverity(conflict);
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <EventIcon color="primary" />
                                  <Typography variant="body2" fontWeight="bold">
                                    {conflict.title}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {new Date(conflict.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {formatTime(conflict.time)}
                              </TableCell>
                              <TableCell>
                                {formatDuration(conflict.duration)}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {conflict.organizer}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={`${getConflictIcon(severity)} ${severity.toUpperCase()}`}
                                  color={getConflictColor(severity)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Alternative suggestions */}
                  {clashResults.alternativeDates && clashResults.alternativeDates.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        💡 Alternative Dates Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        The same venue is available on these dates:
                      </Typography>
                      <Grid container spacing={1}>
                        {clashResults.alternativeDates.map((date, index) => (
                          <Grid item key={index}>
                            <Chip
                              label={new Date(date).toLocaleDateString()}
                              color="info"
                              variant="outlined"
                              icon={<ScheduleIcon />}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Recommendations */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      💡 Recommendations
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      • Consider choosing a different time slot on the same date
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      • Try one of the alternative dates suggested above
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      • Contact the event organizer to discuss potential coordination
                    </Typography>
                    <Typography variant="body2">
                      • Consider using a different venue if available
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowClashDialog(false)}>
            Close
          </Button>
          {clashResults?.available && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                setShowClashDialog(false);
                // Pre-fill the form with the successful booking data
                setClashForm({
                  ...clashForm,
                  date: clashResults.date,
                  time: clashResults.time,
                  duration: clashResults.duration,
                  venue: clashResults.venue
                });
                setSuccess('Time slot confirmed! You can now create your event with these details.');
              }}
            >
              Use This Time Slot
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Information Cards */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">How It Works</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                The clash detector checks for overlapping events at the same venue,
                considering time conflicts and resource availability to prevent
                double-booking scenarios.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Conflict Levels</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>High:</strong> Complete time overlap<br/>
                <strong>Medium:</strong> Partial time overlap<br/>
                <strong>Low:</strong> Minimal time overlap
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Best Practices</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                • Check availability before creating events<br/>
                • Consider setup and cleanup time<br/>
                • Plan for buffer time between events<br/>
                • Coordinate with other organizers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventClashDetector;
