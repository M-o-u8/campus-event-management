import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField as MuiTextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Person, 
  Edit, 
  Save, 
  Cancel, 
  Delete, 
  Warning,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { currentUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Delete account states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    bio: '',
    interests: [],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: ''
    }
  });

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        department: response.data.profile?.department || '',
        phone: response.data.profile?.phone || '',
        bio: response.data.profile?.bio || '',
        interests: response.data.profile?.interests || [],
        socialLinks: {
          linkedin: response.data.profile?.socialLinks?.linkedin || '',
          twitter: response.data.profile?.socialLinks?.twitter || '',
          github: response.data.profile?.socialLinks?.github || ''
        }
      });
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch profile');
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleInterestChange = (interest, action) => {
    if (action === 'add' && interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    } else if (action === 'remove') {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: formData.name,
        profile: {
          department: formData.department,
          phone: formData.phone,
          bio: formData.bio,
          interests: formData.interests,
          socialLinks: formData.socialLinks
        }
      };

      await axios.put('http://localhost:5000/api/auth/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
      
      // Update local user context
      if (updateUser) {
        updateUser({ ...currentUser, ...updateData });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    fetchProfile(); // Reset form data
  };

  // Delete Account Functions
  const handleDeleteAccountClick = () => {
    setDeleteDialogOpen(true);
    setPassword('');
    setDeleteError('');
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setDeleteError('Password is required');
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      const token = localStorage.getItem('token');
      
      // First verify password
      const verifyResponse = await axios.post('http://localhost:5000/api/auth/verify-password', {
        password: password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (verifyResponse.data.valid) {
        // Password verified, proceed with account deletion
        await axios.delete(`http://localhost:5000/api/users/${currentUser._id || currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Close dialogs
        setDeleteDialogOpen(false);
        setDeleteConfirmDialogOpen(false);
        
        // Logout and redirect
        logout();
        navigate('/');
        
        // Show success message (though user won't see it due to redirect)
        setSuccess('Account deleted successfully');
      } else {
        setDeleteError('Invalid password');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      if (error.response?.status === 401) {
        setDeleteError('Invalid password');
      } else if (error.response?.status === 403) {
        setDeleteError('You cannot delete your account while you have active events or registrations');
      } else {
        setDeleteError(error.response?.data?.message || 'Failed to delete account');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmDialogOpen(false);
    setPassword('');
    setDeleteError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (deleteError) setDeleteError('');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
            <Person sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {profile?.name || 'User Profile'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {profile?.roles?.join(', ')} • {profile?.profile?.department || 'No department'}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box display="flex" justifyContent="flex-end" mb={2}>
          {!editing ? (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!editing}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              disabled
              margin="normal"
              helperText="Email cannot be changed"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => handleInputChange('profile.department', e.target.value)}
              disabled={!editing}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('profile.phone', e.target.value)}
              disabled={!editing}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('profile.bio', e.target.value)}
              disabled={!editing}
              multiline
              rows={4}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Interests
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {formData.interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  onDelete={editing ? () => handleInterestChange(interest, 'remove') : undefined}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            {editing && (
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Add interest"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleInterestChange(e.target.value.trim(), 'add');
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add interest"]');
                    if (input && input.value.trim()) {
                      handleInterestChange(input.value.trim(), 'add');
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Social Links
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleInputChange('profile.socialLinks.linkedin', e.target.value)}
                  disabled={!editing}
                  placeholder="https://linkedin.com/in/username"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleInputChange('profile.socialLinks.twitter', e.target.value)}
                  disabled={!editing}
                  placeholder="https://twitter.com/username"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="GitHub"
                  value={formData.socialLinks.github}
                  onChange={(e) => handleInputChange('profile.socialLinks.github', e.target.value)}
                  disabled={!editing}
                  placeholder="https://github.com/username"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Delete Account Section */}
        <Divider sx={{ my: 4 }} />
        
        <Box>
          <Typography variant="h6" color="error" gutterBottom>
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            Dangerous Zone
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> Deleting your account is permanent and cannot be undone. 
              This will remove all your data, event registrations, and profile information.
            </Typography>
          </Alert>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteAccountClick}
            sx={{ mt: 1 }}
          >
            Delete My Account
          </Button>
        </Box>

        {/* Delete Account Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="error" />
              Delete Account
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogContentText>
            
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              <strong>What will be deleted:</strong>
            </Typography>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
              <li>Your profile and personal information</li>
              <li>All event registrations</li>
              <li>Event history and feedback</li>
              <li>Account settings and preferences</li>
            </ul>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              To confirm deletion, please enter your password:
            </Typography>
            
            <MuiTextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              error={!!deleteError}
              helperText={deleteError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              disabled={!password.trim() || deleteLoading}
            >
              Continue to Confirmation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Final Confirmation Dialog */}
        <Dialog 
          open={deleteConfirmDialogOpen} 
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="error" />
              Final Confirmation
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Are you absolutely sure?</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This is your final warning. Once you click "Delete Account", your account will be permanently removed and you will be logged out immediately.
              </Typography>
              <Typography variant="body2" color="error">
                <strong>This action cannot be undone!</strong>
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAccount} 
              color="error" 
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account Permanently'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Profile;


