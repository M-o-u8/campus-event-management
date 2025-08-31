import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  PieChart as ChartIcon
} from '@mui/icons-material';
import axios from 'axios';

const EventBudget = ({ eventId, isOrganizer }) => {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: '',
    currency: 'USD',
    categories: []
  });
  
  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    currency: 'USD',
    receipt: null
  });

  const expenseCategories = [
    'food', 'decorations', 'printing', 'equipment', 'venue', 'marketing', 'other'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  useEffect(() => {
    fetchBudgetData();
  }, [eventId]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [budgetResponse, expensesResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/events/${eventId}/budget-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/events/${eventId}/expenses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setBudget(budgetResponse.data.budget);
      setExpenses(expensesResponse.data.expenses || []);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      setError('Failed to fetch budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${eventId}/budget`, budgetForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBudgetDialogOpen(false);
      fetchBudgetData();
      setBudgetForm({ totalBudget: '', currency: 'USD', categories: [] });
    } catch (error) {
      console.error('Error setting budget:', error);
      setError('Failed to set budget');
    }
  };

  const handleExpenseSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(expenseForm).forEach(key => {
        if (expenseForm[key] !== null) {
          formData.append(key, expenseForm[key]);
        }
      });

      if (editingExpense) {
        await axios.put(`http://localhost:5000/api/events/${eventId}/expenses/${editingExpense._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/events/${eventId}/expenses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setExpenseDialogOpen(false);
      setEditingExpense(null);
      fetchBudgetData();
      setExpenseForm({ category: '', description: '', amount: '', currency: 'USD', receipt: null });
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense');
    }
  };

  const handleExpenseApproval = async (expenseId, approved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/events/${eventId}/expenses/${expenseId}/approve`, 
        { approved }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchBudgetData();
    } catch (error) {
      console.error('Error updating expense status:', error);
      setError('Failed to update expense status');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${eventId}/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchBudgetData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense');
    }
  };

  const getBudgetProgress = () => {
    if (!budget || budget.totalBudget === 0) return 0;
    return Math.min(100, (budget.totalSpent / budget.totalBudget) * 100);
  };

  const getBudgetStatus = () => {
    if (!budget) return 'info';
    if (budget.totalSpent > budget.totalBudget) return 'error';
    if (budget.totalSpent > budget.totalBudget * 0.8) return 'warning';
    return 'success';
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Event Budget & Expenses
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Budget Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Budget Overview</Typography>
            {isOrganizer && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setBudgetDialogOpen(true)}
              >
                Set Budget
              </Button>
            )}
          </Box>

          {budget ? (
            <Box>
              <Grid container spacing={3} mb={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Budget
                  </Typography>
                  <Typography variant="h6">
                    {budget.currency} {budget.totalBudget.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Spent
                  </Typography>
                  <Typography variant="h6" color="error">
                    {budget.currency} {budget.totalSpent.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Pending
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {budget.currency} {budget.totalPending.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Remaining
                  </Typography>
                  <Typography variant="h6" color={budget.remaining >= 0 ? 'success.main' : 'error.main'}>
                    {budget.currency} {budget.remaining.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Budget Usage</Typography>
                  <Typography variant="body2">{getBudgetProgress().toFixed(1)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getBudgetProgress()}
                  color={getBudgetStatus()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Category Breakdown */}
              {budget.categories && budget.categories.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" mb={2}>Category Breakdown</Typography>
                  <Grid container spacing={2}>
                    {budget.categories.map((category, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box p={2} border={1} borderColor="divider" borderRadius={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {category.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Allocated: {budget.currency} {category.allocated.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Spent: {budget.currency} {category.spent.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Remaining: {budget.currency} {category.remaining.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              No budget has been set for this event. {isOrganizer && 'Click "Set Budget" to get started.'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Expenses</Typography>
            {isOrganizer && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setExpenseDialogOpen(true)}
              >
                Add Expense
              </Button>
            )}
          </Box>

          {expenses.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Added By</TableCell>
                    <TableCell>Date</TableCell>
                    {isOrganizer && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>
                        <Chip
                          label={expense.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        {expense.currency} {expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={expense.status}
                          size="small"
                          color={
                            expense.status === 'approved' ? 'success' :
                            expense.status === 'pending' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>{expense.addedBy?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {new Date(expense.addedAt).toLocaleDateString()}
                      </TableCell>
                      {isOrganizer && (
                        <TableCell>
                          <Box>
                            {expense.status === 'pending' && (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleExpenseApproval(expense._id, true)}
                              >
                                <CheckIcon />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditingExpense(expense);
                                setExpenseForm({
                                  category: expense.category,
                                  description: expense.description,
                                  amount: expense.amount.toString(),
                                  currency: expense.currency,
                                  receipt: null
                                });
                                setExpenseDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteExpense(expense._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No expenses have been added yet. {isOrganizer && 'Click "Add Expense" to get started.'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onClose={() => setBudgetDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Set Event Budget</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Budget"
                type="number"
                value={budgetForm.totalBudget}
                onChange={(e) => setBudgetForm({ ...budgetForm, totalBudget: e.target.value })}
                InputProps={{
                  startAdornment: <InputLabel>Amount</InputLabel>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={budgetForm.currency}
                  onChange={(e) => setBudgetForm({ ...budgetForm, currency: e.target.value })}
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBudgetSubmit} variant="contained">Set Budget</Button>
        </DialogActions>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  {expenseCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputLabel>Amount</InputLabel>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={expenseForm.currency}
                  onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value })}
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setExpenseDialogOpen(false);
            setEditingExpense(null);
            setExpenseForm({ category: '', description: '', amount: '', currency: 'USD', receipt: null });
          }}>
            Cancel
          </Button>
          <Button onClick={handleExpenseSubmit} variant="contained">
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventBudget;

