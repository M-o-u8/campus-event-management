import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Tooltip,
  Divider,
  Badge
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Palette,
  School,
  Event,
  AdminPanelSettings,
  Person,
  Logout,
  Settings,
  Notifications
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  
  const navigate = useNavigate();
  const { currentUser, logout, switchRole } = useAuth();
  const { themeMode, changeTheme, availableThemes } = useTheme();

  useEffect(() => {
    // Component mounted - no need for debug logs
  }, [currentUser]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenuOpen = (event) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleRoleMenuOpen = (event) => {
    setRoleMenuAnchor(event.currentTarget);
  };

  const handleRoleMenuClose = () => {
    setRoleMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    handleThemeMenuClose();
  };

  const handleRoleSwitch = async (newRole) => {
    try {
      if (!currentUser?.roles?.includes(newRole)) {
        alert(`You don't have the ${newRole} role assigned.`);
        return;
      }
      
      const result = await switchRole(newRole);
      
      if (result.success) {
        handleRoleMenuClose();
        navigate(`/${result.newRole}`);
        window.location.reload();
      } else {
        alert(`Failed to switch role: ${result.error}`);
      }
    } catch (error) {
      console.error('Role switch error in navbar:', error);
      alert('An error occurred while switching roles. Please try again.');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <School />;
      case 'organizer':
        return <Event />;
      case 'admin':
        return <AdminPanelSettings />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student':
        return 'primary';
      case 'organizer':
        return 'secondary';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'light':
        return <Brightness7 />;
      case 'dark':
        return <Brightness4 />;
      case 'colorful':
        return <Palette />;
      default:
        return <Brightness7 />;
    }
  };

  if (!currentUser) {
    return (
      <AppBar 
        position="static" 
        elevation={4}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          borderRadius: 0,
          minHeight: '64px',
          zIndex: 9999
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                cursor: 'pointer',
                color: 'white'
              }}
            >
              Campus Events (Not Logged In)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              Please log in
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="static" 
      elevation={4}
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        borderRadius: 0,
        minHeight: '64px',
        zIndex: 9999
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
        {/* Left side - Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              cursor: 'pointer',
              color: 'white',
              '&:hover': {
                opacity: 0.8
              }
            }}
            onClick={() => navigate('/')}
          >
            Campus Events
          </Typography>
        </Box>

        {/* Center - Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate(`/${currentUser.currentRole}`)}
            sx={{ 
              fontWeight: 500,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/community')}
            sx={{ 
              fontWeight: 500,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Community
          </Button>
        </Box>

        {/* Right side - User controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Selector */}
          <Tooltip title="Change Theme">
            <IconButton
              color="inherit"
              onClick={handleThemeMenuOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {getThemeIcon(themeMode)}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Role Switcher */}
          {currentUser?.roles && Array.isArray(currentUser.roles) && currentUser.roles.length > 1 && (
            <Tooltip title={`Switch Role (Current: ${currentUser.currentRole})`}>
              <IconButton
                color="inherit"
                onClick={handleRoleMenuOpen}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {getRoleIcon(currentUser.currentRole)}
              </IconButton>
            </Tooltip>
          )}
          
          {/* Current Role Display */}
          <Chip
            icon={getRoleIcon(currentUser.currentRole)}
            label={currentUser.currentRole ? currentUser.currentRole.charAt(0).toUpperCase() + currentUser.currentRole.slice(1) : 'User'}
            color={getRoleColor(currentUser.currentRole)}
            variant="outlined"
            size="small"
            sx={{ 
              textTransform: 'capitalize',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.8)',
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />

          {/* User Menu */}
          <Tooltip title="User Menu">
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Theme Selection Menu */}
      <Menu
        anchorEl={themeMenuAnchor}
        open={Boolean(themeMenuAnchor)}
        onClose={handleThemeMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 150,
            mt: 1
          }
        }}
      >
        {availableThemes.map((theme) => (
          <MenuItem
            key={theme}
            onClick={() => handleThemeChange(theme)}
            selected={theme === themeMode}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1.5
            }}
          >
            {getThemeIcon(theme)}
            <Typography sx={{ textTransform: 'capitalize' }}>
              {theme}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 300,
            mt: 1,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        
        <MenuItem onClick={() => { navigate('/notifications'); handleNotificationMenuClose(); }}>
          <Typography variant="body2" color="text.secondary">
            View all notifications
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={() => { navigate('/profile'); handleNotificationMenuClose(); }}>
          <Typography variant="body2" color="text.secondary">
            Profile updated successfully
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={() => { navigate('/events'); handleNotificationMenuClose(); }}>
          <Typography variant="body2" color="text.secondary">
            New event available: Campus Cultural Festival
          </Typography>
        </MenuItem>
      </Menu>

      {/* Role Selection Menu */}
      {currentUser.roles && currentUser.roles.length > 1 && (
        <Menu
          anchorEl={roleMenuAnchor}
          open={Boolean(roleMenuAnchor)}
          onClose={handleRoleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 150,
              mt: 1
            }
          }}
        >
          {currentUser.roles.map((role) => (
            <MenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              selected={role === currentUser.currentRole}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.5
              }}
            >
              {getRoleIcon(role)}
              <Typography sx={{ textTransform: 'capitalize' }}>
                {role}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      )}

            {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {currentUser.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentUser.email || 'user@example.com'}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        
        <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
          <Settings sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
