import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { QrCodeScanner, CheckCircle, Error } from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const QRCodeScanner = ({ open, onClose, eventId, onAttendanceMarked }) => {
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open && !scanner) {
      initializeScanner();
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [open]);

  const initializeScanner = () => {
    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Handle scan error silently
        }
      );

      setScanner(html5QrcodeScanner);
      setScanning(true);
    } catch (error) {
      setError('Failed to initialize scanner');
      console.error('Scanner initialization error:', error);
    }
  };

  const handleScanSuccess = async (decodedText, decodedResult) => {
    try {
      setScanning(false);
      setResult(decodedResult);
      
      // Parse QR data
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch {
        // If not JSON, treat as simple text
        qrData = { ticketId: decodedText };
      }

      // Mark attendance
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/scan-attendance`,
        { qrData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Attendance marked successfully!');
      if (onAttendanceMarked) {
        onAttendanceMarked(response.data.attendee);
      }

      // Stop scanner
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to mark attendance');
      console.error('Attendance marking error:', error);
    }
  };

  const handleClose = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
    setResult(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const resetScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
    setResult(null);
    setError('');
    setSuccess('');
    initializeScanner();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeScanner />
          Scan QR Code for Attendance
        </Box>
      </DialogTitle>
      
      <DialogContent>
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

        {!success && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Position the QR code within the scanner frame to mark attendance.
            </Typography>
            
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <div id="qr-reader" style={{ width: '100%' }}></div>
              
              {scanning && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Scanning...</Typography>
                </Box>
              )}
            </Paper>

            {result && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Scan Result:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(result, null, 2)}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {success ? (
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={resetScanner} variant="outlined">
              Reset Scanner
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeScanner;
