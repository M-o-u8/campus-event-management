import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { QrCode, Download, ContentCopy } from '@mui/icons-material';
import QRCode from 'qrcode';
import axios from 'axios';

const QRCodeGenerator = ({ eventId, userId, open, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (open && eventId && userId) {
      generateQRCode();
    }
  }, [open, eventId, userId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/qr-code/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrData(response.data.qrData);
      
      // Generate QR code on canvas
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, JSON.stringify(response.data.qrData), {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `event-ticket-${eventId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyTicketId = () => {
    if (!qrData?.ticketId) return;
    
    navigator.clipboard.writeText(qrData.ticketId).then(() => {
      // You could add a toast notification here
      console.log('Ticket ID copied to clipboard');
    });
  };

  const handleClose = () => {
    setQrData(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode />
          Event Ticket QR Code
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {qrData && !loading && (
          <Box sx={{ textAlign: 'center' }}>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Box id="qr-code" sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <canvas ref={canvasRef} />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {qrData.eventTitle}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Date: {new Date(qrData.date).toLocaleDateString()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Venue: {qrData.venue}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" display="block">
                Ticket ID: {qrData.ticketId}
              </Typography>
            </Paper>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadQRCode}
              >
                Download QR
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={copyTicketId}
              >
                Copy Ticket ID
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeGenerator;
