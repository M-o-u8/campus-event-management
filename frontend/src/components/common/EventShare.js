import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Chip,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Email,
  CalendarToday,
  Link,
  ContentCopy,
  Close
} from '@mui/icons-material';

const EventShare = ({ event, open, onClose }) => {
  const [shareLink, setShareLink] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (event && event._id) {
      const baseUrl = window.location.origin;
      const eventUrl = `${baseUrl}/event/${event._id}`;
      setShareLink(eventUrl);
    } else {
      // Fallback for when event doesn't have an ID
      setShareLink(`${window.location.origin}/events`);
    }
  }, [event]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setSnackbarMessage('Link copied to clipboard!');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Failed to copy link');
      setShowSnackbar(true);
    }
  };

  const handleSocialShare = (platform) => {
    if (!event) return;
    
    const eventTitle = encodeURIComponent(event.title || 'Event');
    const eventDescription = encodeURIComponent(event.description || 'Join this event');
    const eventUrl = encodeURIComponent(shareLink);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${eventUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${eventTitle}&url=${eventUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${eventUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${eventTitle}%20${eventUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${eventTitle}&body=${eventDescription}%0A%0AJoin us at: ${eventUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    
    const eventDate = new Date(event.date);
    const startTime = event.time;
    const endTime = calculateEndTime(startTime, 2); // Default 2 hours duration
    
    const calendarUrl = generateCalendarUrl({
      title: event.title || 'Event',
      description: event.description || 'Join this event',
      startDate: eventDate,
      startTime,
      endTime,
      venue: event.venue || 'TBD'
    });
    
    window.open(calendarUrl, '_blank');
  };

  const calculateEndTime = (startTime, durationHours) => {
    if (!startTime) return '18:00'; // Default fallback
    
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + durationHours;
      return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return '18:00'; // Fallback if parsing fails
    }
  };

  const generateCalendarUrl = ({ title, description, startDate, startTime, endTime, venue }) => {
    try {
      const startDateTime = new Date(startDate);
      const [startHour, startMinute] = (startTime || '10:00').split(':').map(Number);
      const [endHour, endMinute] = (endTime || '12:00').split(':').map(Number);
      
      startDateTime.setHours(startHour, startMinute, 0);
      const endDateTime = new Date(startDate);
      endDateTime.setHours(endHour, endMinute, 0);
      
      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };
      
      // Google Calendar
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDateTime)}/${formatDate(endDateTime)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(venue)}`;
      
      return googleUrl;
    } catch (error) {
      console.error('Error generating calendar URL:', error);
      return 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    }
  };

  const socialPlatforms = [
    { name: 'Facebook', icon: <Facebook />, color: '#1877f2', platform: 'facebook' },
    { name: 'Twitter', icon: <Twitter />, color: '#1da1f2', platform: 'twitter' },
    { name: 'LinkedIn', icon: <LinkedIn />, color: '#0077b5', platform: 'linkedin' },
    { name: 'WhatsApp', icon: <WhatsApp />, color: '#25d366', platform: 'whatsapp' },
    { name: 'Email', icon: <Email />, color: '#ea4335', platform: 'email' }
  ];

  // Don't render if no event data
  if (!event) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Share Event</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share "{event.title || 'Event'}" with your network
          </Typography>

          {/* Social Media Sharing */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Share on Social Media
            </Typography>
            <Grid container spacing={2}>
              {socialPlatforms.map((platform) => (
                <Grid item xs={6} sm={4} key={platform.platform}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={platform.icon}
                    onClick={() => handleSocialShare(platform.platform)}
                    sx={{
                      borderColor: platform.color,
                      color: platform.color,
                      '&:hover': {
                        borderColor: platform.color,
                        backgroundColor: `${platform.color}10`
                      }
                    }}
                  >
                    {platform.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Calendar Integration */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add to Calendar
            </Typography>
            <Button
              fullWidth
              variant="contained"
              startIcon={<CalendarToday />}
              onClick={handleAddToCalendar}
              sx={{ mb: 2 }}
            >
              Add to Google Calendar
            </Button>
            <Typography variant="caption" color="text.secondary">
              Add this event to your calendar with all the details
            </Typography>
          </Box>

          {/* Direct Link Sharing */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Share Link
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={shareLink}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopyLink}
              >
                Copy
              </Button>
            </Box>
          </Box>

          {/* Event Preview */}
          <Box sx={{ 
            p: 2, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1,
            backgroundColor: 'background.default'
          }}>
            <Typography variant="subtitle2" gutterBottom>
              Event Preview
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{event.title || 'Event Title'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'} at {event.time || 'Time TBD'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📍 {event.venue || 'Venue TBD'}
            </Typography>
            {event.category && (
              <Chip 
                label={event.category} 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventShare;
