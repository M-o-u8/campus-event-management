import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Badge,
  Paper
} from '@mui/material';
import {
  Search,
  Event,
  People,
  Forum,
  Add,
  Favorite,
  Share,
  LocationOn,
  Schedule,
  Group,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Community = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch events
      const eventsResponse = await axios.get('http://localhost:5000/api/events', { headers });
      setEvents(eventsResponse.data.events || eventsResponse.data);

      // Fetch users (for now, we'll simulate this)
      const mockUsers = [
        { id: 1, name: 'John Student', role: 'student', department: 'Computer Science', avatar: 'JS' },
        { id: 2, name: 'Sajid Sarower', role: 'organizer', department: 'Events Department', avatar: 'SS' },
        { id: 3, name: 'Admin User', role: 'admin', department: 'Administration', avatar: 'AU' }
      ];
      setUsers(mockUsers);

      // Mock discussions
      const mockDiscussions = [
        {
          id: 1,
          title: 'Best study spots on campus?',
          author: 'John Student',
          content: 'Looking for quiet places to study. Any recommendations?',
          replies: 5,
          likes: 12,
          timestamp: '2 hours ago'
        },
        {
          id: 2,
          title: 'Upcoming cultural events',
          author: 'Sajid Sarower',
          content: 'We have some amazing cultural events coming up! Stay tuned.',
          replies: 3,
          likes: 8,
          timestamp: '1 day ago'
        }
      ];
      setDiscussions(mockDiscussions);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching community data:', error);
      setError('Failed to fetch community data');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Campus Community Hub
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Connect, collaborate, and stay updated with your campus community
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search events, people, or discussions..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="community tabs">
          <Tab label="Events" icon={<Event />} />
          <Tab label="People" icon={<People />} />
          <Tab label="Discussions" icon={<Forum />} />
        </Tabs>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {event.venue}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={event.category} size="small" color="primary" />
                    <Chip label={event.status} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {user.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.role} • {user.department}
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" size="small" startIcon={<Add />}>
                    Connect
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {discussions.map((discussion) => (
            <Grid item xs={12} key={discussion.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {discussion.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {discussion.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        By {discussion.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {discussion.timestamp}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small">
                        <Favorite sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography variant="caption">{discussion.likes}</Typography>
                      <IconButton size="small">
                        <Share sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography variant="caption">{discussion.replies} replies</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Community Stats
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {events.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming Events
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Members
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {discussions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Discussions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {events.filter(e => e.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved Events
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Community;
