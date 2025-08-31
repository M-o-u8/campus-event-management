import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');

  // Theme configurations
  const themes = {
    light: createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#3B82F6',
          light: '#60A5FA',
          dark: '#1D4ED8',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#64748B',
          light: '#94A3B8',
          dark: '#334155',
          contrastText: '#FFFFFF',
        },
        background: {
          default: '#FFFFFF',
          paper: '#F8FAFC',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
        success: {
          main: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          main: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        error: {
          main: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        divider: '#E2E8F0',
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
        },
        h2: {
          fontWeight: 600,
          fontSize: '2rem',
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.5rem',
        },
        h4: {
          fontWeight: 500,
          fontSize: '1.25rem',
        },
        h5: {
          fontWeight: 500,
          fontSize: '1.125rem',
        },
        h6: {
          fontWeight: 500,
          fontSize: '1rem',
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontWeight: 500,
            },
            contained: {
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.15)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
          },
        },
      },
    }),

    dark: createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#60A5FA',
          light: '#93C5FD',
          dark: '#3B82F6',
          contrastText: '#0F172A',
        },
        secondary: {
          main: '#94A3B8',
          light: '#CBD5E1',
          dark: '#64748B',
          contrastText: '#0F172A',
        },
        background: {
          default: '#0F172A',
          paper: '#1E293B',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
        },
        success: {
          main: '#34D399',
          light: '#6EE7B7',
          dark: '#10B981',
        },
        warning: {
          main: '#FBBF24',
          light: '#FCD34D',
          dark: '#F59E0B',
        },
        error: {
          main: '#F87171',
          light: '#FCA5A5',
          dark: '#EF4444',
        },
        divider: '#334155',
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
        },
        h2: {
          fontWeight: 600,
          fontSize: '2rem',
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.5rem',
        },
        h4: {
          fontWeight: 500,
          fontSize: '1.25rem',
        },
        h5: {
          fontWeight: 500,
          fontSize: '1.125rem',
        },
        h6: {
          fontWeight: 500,
          fontSize: '1rem',
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontWeight: 500,
            },
            contained: {
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3)',
              '&:hover': {
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.4)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
          },
        },
      },
    }),

    colorful: createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#EC4899',
          light: '#F472B6',
          dark: '#DB2777',
          contrastText: '#FFFFFF',
        },
        background: {
          default: '#FEF7FF',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#581C87',
          secondary: '#7C2D92',
        },
        success: {
          main: '#059669',
          light: '#10B981',
          dark: '#047857',
        },
        warning: {
          main: '#D97706',
          light: '#F59E0B',
          dark: '#B45309',
        },
        error: {
          main: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
        },
        divider: '#D8B4FE',
      },
      typography: {
        fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
        },
        h2: {
          fontWeight: 600,
          fontSize: '2rem',
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.5rem',
        },
        h4: {
          fontWeight: 500,
          fontSize: '1.25rem',
        },
        h5: {
          fontWeight: 500,
          fontSize: '1.125rem',
        },
        h6: {
          fontWeight: 500,
          fontSize: '1rem',
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
      },
      shape: {
        borderRadius: 16,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontWeight: 600,
            },
            contained: {
              boxShadow: '0px 4px 15px rgba(139, 92, 246, 0.2)',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              boxShadow: '0px 8px 25px rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 20,
            },
          },
        },
      },
    }),
  };

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('themeMode') || 'light';
    setThemeMode(savedTheme);
  }, []);

  const changeTheme = (newTheme) => {
    setThemeMode(newTheme);
    localStorage.setItem('themeMode', newTheme);
  };

  const currentTheme = themes[themeMode];

  const value = {
    themeMode,
    changeTheme,
    currentTheme,
    availableThemes: Object.keys(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
