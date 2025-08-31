import React, { useState } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  School,
  Event,
  AdminPanelSettings,
  Info,
  SwapHoriz
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const RoleSwitcher = () => {
  const { currentUser, switchRole } = useAuth();
  const [loading, setLoading] = useState(false);

  // Always show RoleSwitcher if user is logged in
  if (!currentUser) {
    return null;
  }

  const handleRoleChange = async (event) => {
    const newRole = event.target.value;
    if (newRole === currentUser.currentRole) return;

    setLoading(true);
    try {
      const result = await switchRole(newRole);
      if (!result.success) {
        console.error('Failed to switch role:', result.error);
      }
    } catch (error) {
      console.error('Role switch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'organizer':
        return 'warning';
      case 'student':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'organizer':
        return 'Organizer';
      case 'student':
        return 'Student';
      default:
        return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'organizer':
        return <Event />;
      case 'student':
        return <School />;
      default:
        return <Info />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Manage system, approve events, view analytics';
      case 'organizer':
        return 'Create events, manage participants, upload media';
      case 'student':
        return 'Register for events, give feedback, get certificates';
      default:
        return '';
    }
  };

  // If user has only one role, show it as a chip with info
  if (currentUser.roles.length <= 1) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Role:
        </Typography>
        <Tooltip title={getRoleDescription(currentUser.currentRole)}>
          <Chip
            icon={getRoleIcon(currentUser.currentRole)}
            label={getRoleLabel(currentUser.currentRole)}
            color={getRoleColor(currentUser.currentRole)}
            size="small"
            variant="filled"
          />
        </Tooltip>
      </Box>
    );
  }

  // If user has multiple roles, show the enhanced switcher
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Active Role:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={currentUser.currentRole}
          onChange={handleRoleChange}
          disabled={loading}
          sx={{
            '& .MuiSelect-select': {
              py: 0.5,
              px: 1,
            },
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getRoleIcon(selected)}
              <Chip
                label={getRoleLabel(selected)}
                color={getRoleColor(selected)}
                size="small"
                variant="filled"
              />
              <SwapHoriz sx={{ fontSize: 16, opacity: 0.7 }} />
            </Box>
          )}
        >
          {currentUser.roles.map((role) => (
            <MenuItem key={role} value={role}>
              <ListItemIcon>
                {getRoleIcon(role)}
              </ListItemIcon>
              <ListItemText
                primary={getRoleLabel(role)}
                secondary={getRoleDescription(role)}
                primaryTypographyProps={{ fontWeight: role === currentUser.currentRole ? 'bold' : 'normal' }}
              />
              {role === currentUser.currentRole && (
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Role count badge */}
      <Tooltip title={`You have ${currentUser.roles.length} role${currentUser.roles.length > 1 ? 's' : ''}`}>
        <Badge badgeContent={currentUser.roles.length} color="secondary">
          <IconButton size="small" sx={{ opacity: 0.7 }}>
            <Info />
          </IconButton>
        </Badge>
      </Tooltip>
    </Box>
  );
};

export default RoleSwitcher;
