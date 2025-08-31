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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ResourceManager = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Resource data
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment',
    category: 'projector',
    description: '',
    location: '',
    capacity: 1,
    requirements: [],
    costPerHour: 0,
    currency: 'USD',
    images: []
  });
  
  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    eventId: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // Availability check
  const [availabilityForm, setAvailabilityForm] = useState({
    startDate: '',
    endDate: ''
  });
  const [availabilityResult, setAvailabilityResult] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    available: '',
    search: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchResources();
    }
  }, [currentUser, filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await axios.get(`http://localhost:5000/api/resources?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResources(response.data.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (resource = null) => {
    if (resource) {
      setSelectedResource(resource);
      setFormData({
        name: resource.name,
        type: resource.type,
        category: resource.category,
        description: resource.description || '',
        location: resource.location,
        capacity: resource.capacity || 1,
        requirements: resource.requirements || [],
        costPerHour: resource.costPerHour || 0,
        currency: resource.currency || 'USD',
        images: resource.images || []
      });
    } else {
      setSelectedResource(null);
      setFormData({
        name: '',
        type: 'equipment',
        category: 'projector',
        description: '',
        location: '',
        capacity: 1,
        requirements: [],
        costPerHour: 0,
        currency: 'USD',
        images: []
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (selectedResource) {
        // Update existing resource
        await axios.put(`http://localhost:5000/api/resources/${selectedResource._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setError('Resource updated successfully');
      } else {
        // Create new resource
        await axios.post('http://localhost:5000/api/resources', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setError('Resource created successfully');
      }
      
      setOpenDialog(false);
      fetchResources();
      setError('');
    } catch (error) {
      console.error('Error saving resource:', error);
      setError(error.response?.data?.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setError('Resource deleted successfully');
      fetchResources();
      setError('');
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  const handleCheckAvailability = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/resources/${resourceId}/check-availability`, 
        availabilityForm, {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAvailabilityResult(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
      setError(error.response?.data?.message || 'Failed to check availability');
    }
  };

  const handleAssignResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/resources/${resourceId}/assign`, 
        assignmentForm, {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setError('Resource assigned successfully');
      setOpenAssignmentDialog(false);
      fetchResources();
      setError('');
    } catch (error) {
      console.error('Error assigning resource:', error);
      setError(error.response?.data?.message || 'Failed to assign resource');
    }
  };

  const getStatusColor = (resource) => {
    if (!resource.isAvailable) return 'error';
    if (resource.maintenanceStatus === 'maintenance') return 'warning';
    return 'success';
  };

  const getStatusText = (resource) => {
    if (!resource.isAvailable) return 'Unavailable';
    if (resource.maintenanceStatus === 'maintenance') return 'Maintenance';
    if (resource.maintenanceStatus === 'out_of_order') return 'Out of Order';
    return 'Available';
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        🏗️ Resource Management
      </Typography>

      {error && (
        <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Search"
                size="small"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search resources..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="venue">Venue</MenuItem>
                  <MenuItem value="furniture">Furniture</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="projector">Projector</MenuItem>
                  <MenuItem value="sound_system">Sound System</MenuItem>
                  <MenuItem value="chairs">Chairs</MenuItem>
                  <MenuItem value="tables">Tables</MenuItem>
                  <MenuItem value="microphone">Microphone</MenuItem>
                  <MenuItem value="screen">Screen</MenuItem>
                  <MenuItem value="hall">Hall</MenuItem>
                  <MenuItem value="room">Room</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.available}
                  onChange={(e) => setFilters({ ...filters, available: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="true">Available</MenuItem>
                  <MenuItem value="false">Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchResources}
              >
                Refresh
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Resource
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="All Resources" icon={<BuildIcon />} />
          <Tab label="Available Resources" icon={<CheckIcon />} />
          <Tab label="Resource Assignments" icon={<AssignmentIcon />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            All Resources ({resources.length})
          </Typography>
          
          <Grid container spacing={3}>
            {resources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {resource.name}
                      </Typography>
                      <Chip
                        label={getStatusText(resource)}
                        color={getStatusColor(resource)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resource.description || 'No description available'}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={resource.type}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={resource.category}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {resource.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Capacity: {resource.capacity}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="primary">
                        ${resource.costPerHour}/{resource.currency}
                      </Typography>
                      
                      <Box>
                        <Tooltip title="Check Availability">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setAvailabilityForm({ startDate: '', endDate: '' });
                              setOpenAvailabilityDialog(true);
                              setSelectedResource(resource);
                            }}
                          >
                            <ScheduleIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Resource">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(resource)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Resource">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(resource._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Available Resources
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Cost/Hour</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources
                  .filter(resource => resource.isAvailable && resource.maintenanceStatus === 'operational')
                  .map((resource) => (
                    <TableRow key={resource._id}>
                      <TableCell>{resource.name}</TableCell>
                      <TableCell>
                        <Chip label={resource.category} size="small" />
                      </TableCell>
                      <TableCell>{resource.location}</TableCell>
                      <TableCell>{resource.capacity}</TableCell>
                      <TableCell>${resource.costPerHour}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setAssignmentForm({ eventId: '', startDate: '', endDate: '', notes: '' });
                            setOpenAssignmentDialog(true);
                            setSelectedResource(resource);
                          }}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 2 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Resource Assignments
          </Typography>
          
          <Grid container spacing={3}>
            {resources
              .filter(resource => resource.assignedTo && resource.assignedTo.length > 0)
              .map((resource) => (
                <Grid item xs={12} md={6} key={resource._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {resource.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {resource.assignedTo.length} active assignments
                      </Typography>
                      
                      {resource.assignedTo
                        .filter(assignment => assignment.status === 'pending' || assignment.status === 'approved')
                        .map((assignment, index) => (
                          <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Event:</strong> {assignment.event?.title || 'Unknown Event'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Period:</strong> {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                            </Typography>
                            <Chip
                              label={assignment.status}
                              color={assignment.status === 'approved' ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                        ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {/* Add/Edit Resource Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedResource ? 'Edit Resource' : 'Add New Resource'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Resource Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="venue">Venue</MenuItem>
                  <MenuItem value="furniture">Furniture</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="projector">Projector</MenuItem>
                  <MenuItem value="sound_system">Sound System</MenuItem>
                  <MenuItem value="chairs">Chairs</MenuItem>
                  <MenuItem value="tables">Tables</MenuItem>
                  <MenuItem value="microphone">Microphone</MenuItem>
                  <MenuItem value="screen">Screen</MenuItem>
                  <MenuItem value="hall">Hall</MenuItem>
                  <MenuItem value="room">Room</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost per Hour"
                type="number"
                value={formData.costPerHour}
                onChange={(e) => setFormData({ ...formData, costPerHour: parseFloat(e.target.value) })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedResource ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Resource: {selectedResource?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event ID"
                value={assignmentForm.eventId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, eventId: e.target.value })}
                placeholder="Enter event ID"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={assignmentForm.startDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date & Time"
                type="datetime-local"
                value={assignmentForm.endDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                placeholder="Optional notes about the assignment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={() => handleAssignResource(selectedResource._id)} variant="contained">
            Assign Resource
          </Button>
        </DialogActions>
      </Dialog>

      {/* Availability Check Dialog */}
      <Dialog open={openAvailabilityDialog} onClose={() => setOpenAvailabilityDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Check Availability: {selectedResource?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={availabilityForm.startDate}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, startDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date & Time"
                type="datetime-local"
                value={availabilityForm.endDate}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, endDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          {availabilityResult && (
            <Box sx={{ mt: 3 }}>
              <Alert severity={availabilityResult.isAvailable ? 'success' : 'error'} sx={{ mb: 2 }}>
                {availabilityResult.suggestion}
              </Alert>
              
              {availabilityResult.conflictingEvents && availabilityResult.conflictingEvents.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Conflicting Events:
                  </Typography>
                  {availabilityResult.conflictingEvents.map((event, index) => (
                    <Box key={index} sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{event.title}</strong> - {new Date(event.date).toLocaleDateString()} at {event.time}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAvailabilityDialog(false)}>Close</Button>
          <Button 
            onClick={() => handleCheckAvailability(selectedResource._id)} 
            variant="contained"
            disabled={!availabilityForm.startDate || !availabilityForm.endDate}
          >
            Check Availability
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ResourceManager;





