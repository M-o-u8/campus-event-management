import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Box,
  Typography,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { Star, ThumbUp, ThumbDown } from '@mui/icons-material';
import axios from 'axios';

const EventFeedback = ({ event, open, onClose, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open && event) {
      fetchExistingFeedback();
    }
  }, [open, event]);

  const fetchExistingFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/events/${event._id}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.feedback) {
        setExistingFeedback(response.data.feedback);
        setRating(response.data.feedback.rating);
        setReview(response.data.feedback.review);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (!review.trim()) {
      setError('Please provide a review');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const feedbackData = {
        rating,
        review: review.trim()
      };

      if (existingFeedback) {
        // Update existing feedback
        await axios.put(`http://localhost:5000/api/events/${event._id}/feedback`, feedbackData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Feedback updated successfully!');
      } else {
        // Submit new feedback
        await axios.post(`http://localhost:5000/api/events/${event._id}/feedback`, feedbackData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Feedback submitted successfully!');
      }

      // Refresh feedback data
      await fetchExistingFeedback();
      
      // Notify parent component
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setError('');
    setSuccess('');
    setExistingFeedback(null);
    onClose();
  };

  if (!event) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
        <Typography variant="subtitle2" color="text.secondary">
          {event.title}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Event Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Event: {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Date: {new Date(event.date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Venue: {event.venue}
          </Typography>
        </Box>

        {/* Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Rate your experience *
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </Typography>
        </Box>

        {/* Review */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Write your review *"
            multiline
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience, what you liked, what could be improved..."
            variant="outlined"
          />
        </Box>

        {/* Existing Feedback Display */}
        {existingFeedback && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Your Previous Feedback:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={existingFeedback.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {existingFeedback.rating}/5
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              "{existingFeedback.review}"
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Submitted on: {new Date(existingFeedback.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || rating === 0 || !review.trim()}
        >
          {loading ? 'Submitting...' : existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventFeedback;
