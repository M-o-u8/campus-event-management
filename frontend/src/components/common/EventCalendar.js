import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Chip
} from '@mui/material';
import { Event, ViewModule, ViewWeek, ViewDay } from '@mui/icons-material';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onEventSelect, height = 600 }) => {
  const [view, setView] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Convert events to calendar format
  const calendarEvents = useMemo(() => {
    return events
      .filter(event => !categoryFilter || event.category === categoryFilter)
      .map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.date + 'T' + event.time),
        end: moment(event.date + 'T' + event.time).add(event.duration || 2, 'hours').toDate(),
        resource: event,
        category: event.category,
        venue: event.venue,
        isPaid: event.isPaid,
        status: event.status
      }));
  }, [events, categoryFilter]);

  const eventStyleGetter = (event) => {
    const colors = {
      academic: '#1976d2',
      social: '#2e7d32',
      sports: '#ed6c02',
      cultural: '#9c27b0',
      technical: '#d32f2f',
      workshop: '#7b1fa2',
      other: '#757575'
    };

    return {
      style: {
        backgroundColor: colors[event.category] || '#757575',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px'
      }
    };
  };

  const handleEventSelect = (event) => {
    if (onEventSelect) {
      onEventSelect(event.resource);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const categories = ['academic', 'social', 'sports', 'cultural', 'technical', 'workshop', 'other'];

  return (
    <Box>
      {/* Calendar Controls */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Event sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Event Calendar</Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<ViewModule />}
            label="Month"
            onClick={() => handleViewChange('month')}
            color={view === 'month' ? 'primary' : 'default'}
            variant={view === 'month' ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            icon={<ViewWeek />}
            label="Week"
            onClick={() => handleViewChange('week')}
            color={view === 'week' ? 'primary' : 'default'}
            variant={view === 'week' ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            icon={<ViewDay />}
            label="Day"
            onClick={() => handleViewChange('day')}
            color={view === 'day' ? 'primary' : 'default'}
            variant={view === 'day' ? 'filled' : 'outlined'}
            clickable
          />
        </Box>
      </Box>

      {/* Category Legend */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {categories.map(category => (
          <Chip
            key={category}
            label={category.charAt(0).toUpperCase() + category.slice(1)}
            size="small"
            sx={{
              backgroundColor: {
                academic: '#1976d2',
                social: '#2e7d32',
                sports: '#ed6c02',
                cultural: '#9c27b0',
                technical: '#d32f2f',
                workshop: '#7b1fa2',
                other: '#757575'
              }[category],
              color: 'white',
              '&:hover': {
                opacity: 0.8
              }
            }}
          />
        ))}
      </Box>

      {/* Calendar */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ height }}>
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: height - 100 }}
            view={view}
            onView={handleViewChange}
            onSelectEvent={handleEventSelect}
            eventPropGetter={eventStyleGetter}
            selectable
            popup
            tooltipAccessor={(event) => `${event.title} - ${event.venue}`}
            messages={{
              next: "Next",
              previous: "Previous",
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              agenda: "Agenda",
              date: "Date",
              time: "Time",
              event: "Event",
              noEventsInRange: "No events in this range."
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default EventCalendar;
