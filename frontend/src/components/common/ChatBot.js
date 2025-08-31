import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Chat,
  Send,
  Close,
  SmartToy,
  Person
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { themeMode } = useTheme();

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your campus event assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Event-related responses
    if (lowerMessage.includes('event') || lowerMessage.includes('events')) {
      if (lowerMessage.includes('create') || lowerMessage.includes('organize')) {
        return {
          id: Date.now(),
          text: "To create an event, you'll need to have an 'organizer' role. You can switch roles using the role switcher in the top navigation bar. Once you're an organizer, you'll see a 'Create Event' button on your dashboard.",
          sender: 'bot',
          timestamp: new Date()
        };
      }
      if (lowerMessage.includes('register') || lowerMessage.includes('sign up')) {
        return {
          id: Date.now(),
          text: "You can register for events from the Student Dashboard. Browse available events, click on any event card, and use the 'Register' button. Make sure to check the event details and registration deadline!",
          sender: 'bot',
          timestamp: new Date()
        };
      }
      if (lowerMessage.includes('find') || lowerMessage.includes('search')) {
        return {
          id: Date.now(),
          text: "Use the search bar and category filters on the Student Dashboard to find events. You can search by event title, description, or filter by categories like academic, social, sports, etc.",
          sender: 'bot',
          timestamp: new Date()
        };
      }
      return {
        id: Date.now(),
        text: "I can help you with events! You can search for events, register for them, or ask about creating events if you're an organizer. What specifically would you like to know?",
        sender: 'bot',
        timestamp: new Date()
      };
    }

    // Role-related responses
    if (lowerMessage.includes('role') || lowerMessage.includes('switch')) {
      return {
        id: Date.now(),
        text: "You can switch between your assigned roles using the role switcher in the top navigation bar. Each role gives you access to different features - students can browse and register for events, organizers can create and manage events, and admins have additional management capabilities.",
        sender: 'bot',
        timestamp: new Date()
      };
    }

    // Theme-related responses
    if (lowerMessage.includes('theme') || lowerMessage.includes('dark') || lowerMessage.includes('light') || lowerMessage.includes('colorful')) {
      return {
        id: Date.now(),
        text: "You can change the theme using the theme switcher button (looks like a sun/moon/color palette icon) in the top navigation bar. We offer light, dark, and colorful themes to suit your preference!",
        sender: 'bot',
        timestamp: new Date()
      };
    }

    // Profile-related responses
    if (lowerMessage.includes('profile') || lowerMessage.includes('account') || lowerMessage.includes('settings')) {
      return {
        id: Date.now(),
        text: "Access your profile and settings from the user menu in the top right corner. You can update your personal information, change your password, and customize your preferences there.",
        sender: 'bot',
        timestamp: new Date()
      };
    }

    // Community-related responses
    if (lowerMessage.includes('community') || lowerMessage.includes('group') || lowerMessage.includes('discussion')) {
      return {
        id: Date.now(),
        text: "Visit the Community section to connect with other students, join groups, and participate in discussions. You can access it from the user menu or navigate to /community.",
        sender: 'bot',
        timestamp: new Date()
      };
    }

    // General help
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      return {
        id: Date.now(),
        text: "I'm here to help! You can ask me about events, roles, themes, profiles, or any other features. Just type your question and I'll do my best to assist you.",
        sender: 'bot',
        timestamp: new Date()
      };
    }

    // Default response
    const defaultResponses = [
      "That's an interesting question! Could you tell me more about what you're looking for?",
      "I'm not sure I understand. Could you rephrase that or ask about something specific like events, roles, or themes?",
      "I'd be happy to help! What would you like to know about the campus event system?",
      "Let me know if you have questions about events, your account, or any other features!"
    ];

    return {
      id: Date.now(),
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <Chat />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '600px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy color="primary" />
            <Typography variant="h6">Campus Event Assistant</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    maxWidth: '80%'
                  }}
                >
                  {message.sender === 'bot' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main'
                      }}
                    >
                      <SmartToy />
                    </Avatar>
                  )}
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: message.sender === 'user' 
                        ? themeMode === 'dark' ? 'primary.dark' : 'primary.light'
                        : themeMode === 'dark' ? 'grey.800' : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      position: 'relative'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        textAlign: 'right'
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Paper>

                  {message.sender === 'user' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'secondary.main'
                      }}
                    >
                      <Person />
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main'
                  }}
                >
                  <SmartToy />
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: themeMode === 'dark' ? 'grey.800' : 'grey.100',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'text.secondary',
                          animation: 'typing 1.4s infinite ease-in-out',
                          '&:nth-of-type(1)': { animationDelay: '0s' },
                          '&:nth-of-type(2)': { animationDelay: '0.2s' },
                          '&:nth-of-type(3)': { animationDelay: '0.4s' },
                          '@keyframes typing': {
                            '0%, 60%, 100%': { transform: 'translateY(0)' },
                            '30%': { transform: 'translateY(-10px)' }
                          }
                        }}
                      />
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'text.secondary',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '0.2s'
                        }}
                      />
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'text.secondary',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '0.4s'
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          <Divider />
          
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Send />
              </Button>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Try asking about: events, roles, themes, profile, or community
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBot;
