import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['student'] // Changed from single role to multiple roles
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const availableRoles = [
    { value: 'student', label: 'Student', description: 'Register for events, give feedback, get certificates' },
    { value: 'organizer', label: 'Event Organizer', description: 'Create and manage events, upload media, track attendance' },
    { value: 'admin', label: 'Administrator', description: 'Approve events, manage users, view analytics' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRoleChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      roles: typeof value === 'string' ? value.split(',') : value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.roles.length === 0) {
      setError('Please select at least one role');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // For now, we'll use the first selected role as the primary role
      // The backend will store all roles and set the first one as currentRole
      const primaryRole = formData.roles[0];
      
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: primaryRole // Backend will handle multiple roles
      });
      
      if (response.data.token) {
        await login(response.data.token, response.data.user);
        
        // Redirect based on user's primary role
        switch (primaryRole) {
          case 'student':
            navigate('/student');
            break;
          case 'organizer':
            navigate('/organizer');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/student');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join our campus event management platform
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="name"
              autoFocus
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="new-password"
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="new-password"
            />
            
            {/* Enhanced Role Selection */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Select Roles</InputLabel>
              <Select
                multiple
                name="roles"
                value={formData.roles}
                onChange={handleRoleChange}
                input={<OutlinedInput label="Select Roles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={availableRoles.find(r => r.value === value)?.label || value}
                        color={value === 'admin' ? 'error' : value === 'organizer' ? 'warning' : 'primary'}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Checkbox checked={formData.roles.indexOf(role.value) > -1} />
                    <ListItemText 
                      primary={role.label}
                      secondary={role.description}
                    />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                You can select multiple roles. Your primary role will be used for initial dashboard access.
              </FormHelperText>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 