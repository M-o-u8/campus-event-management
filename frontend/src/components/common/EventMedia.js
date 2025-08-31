import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  PhotoCamera,
  VideoLibrary,
  Delete,
  Download,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const EventMedia = ({ eventId, media, onMediaUpdate, isOrganizer = false }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState({});

  const onDrop = async (acceptedFiles) => {
    if (!isOrganizer) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('media', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (onMediaUpdate) {
        onMediaUpdate(response.data.media);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      setError(error.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const handleDeleteMedia = async (mediaId) => {
    if (!isOrganizer) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/events/${eventId}/media/${mediaId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (onMediaUpdate) {
        onMediaUpdate(media.filter(m => m._id !== mediaId));
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      setError('Failed to delete media');
    }
  };

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setPreviewOpen(true);
  };

  const handleDownload = (mediaItem) => {
    const link = document.createElement('a');
    link.href = mediaItem.url;
    link.download = mediaItem.filename || `event-media-${mediaItem._id}`;
    link.click();
  };

  const toggleVideoPlay = (mediaId) => {
    setVideoPlaying(prev => ({
      ...prev,
      [mediaId]: !prev[mediaId]
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Event Media Gallery
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      {isOrganizer && (
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            mb: 3,
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease'
          }}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>Uploading media...</Typography>
            </Box>
          ) : (
            <Box>
              <PhotoCamera sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop files here' : 'Upload Photos & Videos'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag & drop files here, or click to select files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports: JPG, PNG, GIF, MP4, AVI (Max: 10MB per file)
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Media Grid */}
      {media && media.length > 0 ? (
        <Grid container spacing={2}>
          {media.map((mediaItem) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={mediaItem._id}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component={mediaItem.type === 'video' ? 'video' : 'img'}
                  height="200"
                  image={mediaItem.url}
                  alt={mediaItem.filename || 'Event media'}
                  sx={{ cursor: 'pointer', objectFit: 'cover' }}
                  onClick={() => handleMediaClick(mediaItem)}
                  controls={mediaItem.type === 'video'}
                  onPlay={() => setVideoPlaying(prev => ({ ...prev, [mediaItem._id]: true }))}
                  onPause={() => setVideoPlaying(prev => ({ ...prev, [mediaItem._id]: false }))}
                />
                <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={mediaItem.type}
                      size="small"
                      color={mediaItem.type === 'image' ? 'primary' : 'secondary'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(mediaItem.size)}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(mediaItem)}
                      title="Download"
                    >
                      <Download fontSize="small" />
                    </IconButton>
                    {isOrganizer && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteMedia(mediaItem._id)}
                        title="Delete"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PhotoCamera sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No media uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isOrganizer ? 'Upload photos and videos to showcase your event!' : 'Check back later for event media.'}
          </Typography>
        </Box>
      )}

      {/* Media Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedMedia?.filename || 'Event Media'}
        </DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <Box sx={{ textAlign: 'center' }}>
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
              )}
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Type:</strong> {selectedMedia.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Size:</strong> {formatFileSize(selectedMedia.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Uploaded:</strong> {new Date(selectedMedia.uploadedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {selectedMedia && (
            <Button
              onClick={() => handleDownload(selectedMedia)}
              startIcon={<Download />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventMedia;

