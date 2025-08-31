import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Delete,
  Add,
  Search,
  School,
  Event,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';
import axios from 'axios';

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableRoles = [
    { value: 'student', label: 'Student', color: 'primary', icon: <School /> },
    { value: 'organizer', label: 'Organizer', color: 'warning', icon: <Event /> },
    { value: 'admin', label: 'Admin', color: 'error', icon: <AdminPanelSettings /> }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      newRoles: [...user.roles],
      newCurrentRole: user.currentRole
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      // Here you would typically call an API endpoint to update user roles
      // For now, we'll simulate the update
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === editingUser._id 
            ? { ...user, roles: editingUser.newRoles, currentRole: editingUser.newCurrentRole }
            : user
        )
      );
      
      setSuccess('User roles updated successfully');
      setEditDialogOpen(false);
      setEditingUser(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user roles');
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleRoleChange = (event) => {
    const { value } = event.target;
    setEditingUser(prev => ({
      ...prev,
      newRoles: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleCurrentRoleChange = (event) => {
    setEditingUser(prev => ({
      ...prev,
      newCurrentRole: event.target.value
    }));
  };

  const getRoleIcon = (role) => {
    const roleInfo = availableRoles.find(r => r.value === role);
    return roleInfo ? roleInfo.icon : <Person />;
  };

  const getRoleColor = (role) => {
    const roleInfo = availableRoles.find(r => r.value === role);
    return roleInfo ? roleInfo.color : 'default';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Role Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage user roles and permissions across the platform
      </Typography>

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

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Users Table */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Current Role</TableCell>
                <TableCell>All Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Typography variant="body2">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.currentRole)}
                      label={user.currentRole}
                      color={getRoleColor(user.currentRole)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.roles.map((role) => (
                        <Chip
                          key={role}
                          icon={getRoleIcon(role)}
                          label={role}
                          color={getRoleColor(role)}
                          size="small"
                          variant={role === user.currentRole ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Roles">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit User Roles: {editingUser?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Roles
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={editingUser?.newRoles || []}
                onChange={handleRoleChange}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        color={getRoleColor(value)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Checkbox checked={(editingUser?.newRoles || []).indexOf(role.value) > -1} />
                    <ListItemText primary={role.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" gutterBottom>
              Current Active Role
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Active Role</InputLabel>
              <Select
                value={editingUser?.newCurrentRole || ''}
                onChange={handleCurrentRoleChange}
                label="Active Role"
              >
                {(editingUser?.newRoles || []).map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;

