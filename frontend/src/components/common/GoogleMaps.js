import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const GoogleMaps = ({ venue, height = 400, width = '100%', open, onClose }) => {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!venue || !open) return;

    const loadGoogleMaps = async () => {
      try {
        setLoading(true);
        setError('');

        // Load Google Maps API
        if (!window.google || !window.google.maps) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => initializeMap();
          script.onerror = () => setError('Failed to load Google Maps');
          
          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load map');
      }
    };

    const initializeMap = () => {
      try {
        // Geocode the venue address
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address: venue }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            const map = new window.google.maps.Map(mapRef.current, {
              center: location,
              zoom: 15,
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            });

            // Add marker
            new window.google.maps.Marker({
              position: location,
              map: map,
              title: venue,
              animation: window.google.maps.Animation.DROP
            });

            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 5px 0; font-size: 16px;">Event Venue</h3>
                  <p style="margin: 0; font-size: 14px;">${venue}</p>
                </div>
              `
            });

            // Show info window on marker click
            const marker = new window.google.maps.Marker({
              position: location,
              map: map,
              title: venue
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            setLoading(false);
          } else {
            setError('Could not find location for this venue');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map');
        setLoading(false);
      }
    };

    loadGoogleMaps();
  }, [venue, open]);

  if (!venue) {
    return null;
  }

  const mapContent = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocationOn color="primary" />
        <Typography variant="h6">Venue Location</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 100 }}>
          <CircularProgress />
        </Box>
      )}

      <Box
        ref={mapRef}
        sx={{
          height: height - 100,
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
        {venue}
      </Typography>
    </Box>
  );

  if (open) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn />
            Event Venue
          </Box>
        </DialogTitle>
        <DialogContent>
          {mapContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Paper sx={{ p: 2, height, width }}>
      {mapContent}
    </Paper>
  );
};

export default GoogleMaps;

