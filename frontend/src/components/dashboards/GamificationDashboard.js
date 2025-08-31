import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Badge
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Leaderboard as LeaderboardIcon,
  MilitaryTech as BadgeIcon,
  Timeline as StatsIcon,
  Refresh as RefreshIcon,
  People,
  Event,
  Schedule
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const GamificationDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gamification data
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [availableBadges, setAvailableBadges] = useState([]);
  
  // Leaderboard types
  const [leaderboardType, setLeaderboardType] = useState('points');

  useEffect(() => {
    if (currentUser) {
      fetchGamificationData();
    }
  }, [currentUser]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all gamification data in parallel
      const [profileRes, leaderboardRes, badgesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/gamification/profile', { headers }),
        axios.get(`http://localhost:5000/api/gamification/leaderboard?type=${leaderboardType}`, { headers }),
        axios.get('http://localhost:5000/api/gamification/badges', { headers })
      ]);

      setProfile(profileRes.data);
      setLeaderboard(leaderboardRes.data.leaderboard);
      setAvailableBadges(badgesRes.data.badges);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      setError('Failed to fetch gamification data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaderboardTypeChange = async (newType) => {
    setLeaderboardType(newType);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/gamification/leaderboard?type=${newType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = (profile.level - 1) * 100;
    const nextLevelPoints = profile.level * 100;
    const progress = ((profile.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getLevelColor = (level) => {
    if (level <= 5) return 'success';
    if (level <= 10) return 'info';
    if (level <= 20) return 'warning';
    return 'error';
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        🏆 Gamification Dashboard
      </Typography>

      {/* Profile Overview */}
      {profile && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3} textAlign="center">
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem',
                    mb: 2
                  }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h6">{currentUser?.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Level {profile.level}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3} textAlign="center">
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {profile.points}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total Points
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3} textAlign="center">
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {profile.badges?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Badges Earned
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3} textAlign="center">
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {profile.achievements?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Achievements
                </Typography>
              </Grid>
            </Grid>
            
            {/* Level Progress */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Level Progress</Typography>
                <Typography variant="body2">
                  {profile.points % 100}/100 points to next level
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getLevelProgress()}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="My Badges" icon={<BadgeIcon />} />
          <Tab label="Statistics" icon={<StatsIcon />} />
          <Tab label="Leaderboard" icon={<LeaderboardIcon />} />
          <Tab label="Available Badges" icon={<TrophyIcon />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* My Badges */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            My Badges & Achievements
          </Typography>
          
          {profile?.badges?.length === 0 ? (
            <Box textAlign="center" py={4}>
              <BadgeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                You haven't earned any badges yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attend events, give feedback, and organize events to earn badges!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {profile?.badges?.map((badge, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h1" sx={{ mb: 2 }}>
                      {badge.icon}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {badge.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {badge.description}
                    </Typography>
                    <Chip
                      label={badge.category}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && (
        <>
          {/* Statistics */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            My Activity Statistics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" color="primary.main">
                  {profile?.stats?.eventsAttended || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Events Attended
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Event sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" color="success.main">
                  {profile?.stats?.eventsOrganized || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Events Organized
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                <Typography variant="h4" color="warning.main">
                  {profile?.stats?.feedbackGiven || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Feedback Given
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                <Typography variant="h4" color="info.main">
                  {profile?.stats?.totalHours || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hours
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {activeTab === 2 && (
        <>
          {/* Leaderboard */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Leaderboard
            </Typography>
            <Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleLeaderboardTypeChange('points')}
                sx={{ mr: 1 }}
                color={leaderboardType === 'points' ? 'primary' : 'default'}
              >
                Points
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleLeaderboardTypeChange('level')}
                sx={{ mr: 1 }}
                color={leaderboardType === 'level' ? 'primary' : 'default'}
              >
                Level
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleLeaderboardTypeChange('badges')}
                sx={{ mr: 1 }}
                color={leaderboardType === 'badges' ? 'primary' : 'default'}
              >
                Badges
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleLeaderboardTypeChange('events')}
                color={leaderboardType === 'events' ? 'primary' : 'default'}
              >
                Events
              </Button>
            </Box>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Badges</TableCell>
                  <TableCell>Events</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((user, index) => (
                  <TableRow key={index} sx={{ 
                    backgroundColor: user.name === currentUser?.name ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index < 3 ? (
                          <Typography variant="h6" sx={{ 
                            color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                            mr: 1
                          }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </Typography>
                        ) : null}
                        <Typography variant="body1" fontWeight="bold">
                          #{user.rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={user.name === currentUser?.name ? 'bold' : 'normal'}>
                        {user.name}
                        {user.name === currentUser?.name && ' (You)'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {user.points}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Level ${user.level}`}
                        color={getLevelColor(user.level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {user.badges}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {user.eventsAttended}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 3 && (
        <>
          {/* Available Badges */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Available Badges to Earn
          </Typography>
          
          <Grid container spacing={3}>
            {availableBadges.map((badge, index) => {
              const isEarned = profile?.badges?.some(b => b.name === badge.name);
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    p: 3,
                    opacity: isEarned ? 0.7 : 1,
                    position: 'relative'
                  }}>
                    {isEarned && (
                      <Chip
                        label="EARNED"
                        color="success"
                        size="small"
                        sx={{ position: 'absolute', top: 16, right: 16 }}
                      />
                    )}
                    
                    <Typography variant="h1" sx={{ mb: 2, opacity: isEarned ? 0.5 : 1 }}>
                      {badge.icon}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>
                      {badge.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {badge.description}
                    </Typography>
                    
                    <Chip
                      label={badge.category}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Requirement: {badge.requirement}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Refresh Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchGamificationData}
        >
          Refresh Data
        </Button>
      </Box>
    </Container>
  );
};

export default GamificationDashboard;
