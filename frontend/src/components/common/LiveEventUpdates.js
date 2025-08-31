import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  NotificationsActive as NotificationsActiveIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';

const LiveEventUpdates = ({ eventId, isOrganizer }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    type: 'info',
    isActive: true
  });

  useEffect(() => {
    if (eventId) {
      fetchUpdates();
    }
  }, [eventId]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/events/${eventId}/live-updates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpdates(response.data.updates || []);
    } catch (err) {
      setError('Failed to fetch live updates');
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (editingUpdate) {
        // Update existing update
        await axios.put(`/api/events/${eventId}/live-updates/${editingUpdate._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Update modified successfully!');
      } else {
        // Create new update
        await axios.post(`/api/events/${eventId}/live-updates`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Live update posted successfully!');
      }
      
      setOpenDialog(false);
      setEditingUpdate(null);
      setFormData({ message: '', type: 'info', isActive: true });
      fetchUpdates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post update');
      console.error('Error posting update:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (updateId) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${eventId}/live-updates/${updateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Update deleted successfully!');
      fetchUpdates();
    } catch (err) {
      setError('Failed to delete update');
      console.error('Error deleting update:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    setFormData({
      message: update.message,
      type: update.type,
      isActive: update.isActive
    });
    setOpenDialog(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'urgent':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOrganizer) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Live Event Updates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Only organizers can post live updates for this event.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Live Event Updates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
            }
          }}
        >
          Post Update
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {updates.length === 0 ? (
        <Card elevation={1}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsActiveIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Live Updates Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start posting live updates to keep attendees informed about event changes, delays, or important announcements.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {updates.map((update, index) => (
            <React.Fragment key={update._id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  mb: 1,
                  border: 1,
                  borderColor: 'divider'
                }}
              >
                <ListItemIcon>
                  {getTypeIcon(update.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {update.message}
                      </Typography>
                      <Chip
                        label={update.type}
                        color={getTypeColor(update.type)}
                        size="small"
                        variant="outlined"
                      />
                      {update.isActive && (
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(update.postedAt)} • {formatDate(update.postedAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Posted by: {update.postedBy?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(update)}
                    color="primary"
                    title="Edit Update"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(update._id)}
                    color="error"
                    title="Delete Update"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              {index < updates.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Add/Edit Update Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUpdate ? 'Edit Live Update' : 'Post Live Update'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Update Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  multiline
                  rows={3}
                  required
                  placeholder="Enter your live update message..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Update Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Update Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="info">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon color="info" />
                        Info
                      </Box>
                    </MenuItem>
                    <MenuItem value="warning">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" />
                        Warning
                      </Box>
                    </MenuItem>
                    <MenuItem value="urgent">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon color="error" />
                        Urgent
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.isActive}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
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
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.message.trim()}
            startIcon={loading ? <LinearProgress /> : null}
          >
            {editingUpdate ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveEventUpdates;

