const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// User registration
const register = async (req, res) => {
  try {
    const { name, email, password, role, roles } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields: name, email, password',
        error: 'Validation failed'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'Registration failed',
        error: 'Email already exists',
        details: 'An account with this email address already exists. Please use a different email or try logging in.'
      });
    }

    // Handle both single role and multiple roles
    let userRoles = [];
    if (roles && Array.isArray(roles) && roles.length > 0) {
      userRoles = roles;
    } else if (role) {
      userRoles = [role];
    } else {
      userRoles = ['student'];
    }

    // Validate roles
    const validRoles = ['student', 'organizer', 'admin'];
    const invalidRoles = userRoles.filter(r => !validRoles.includes(r));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        message: `Invalid roles: ${invalidRoles.join(', ')}. Must be student, organizer, or admin`,
        error: 'Invalid roles'
      });
    }

    // Create user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      roles: userRoles,
      currentRole: userRoles[0],
      isActive: true
    };

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Registration failed',
        error: 'Email already exists',
        details: 'An account with this email address already exists. Please use a different email or try logging in.'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Registration failed due to validation errors',
        error: 'Validation failed',
        details: validationErrors.join(', ')
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: 'Server error',
      details: 'An unexpected error occurred. Please try again.'
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: 'Login failed',
        error: 'Account not found',
        details: `No account found with email: ${email}. Please check your email or register a new account.`
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Login failed',
        error: 'Account deactivated',
        details: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Login failed',
        error: 'Invalid password',
        details: 'The password you entered is incorrect. Please try again.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
        profile: user.profile || {},
        preferences: user.preferences || {}
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: 'Server error',
      details: 'An unexpected error occurred. Please try again.'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, department, phone, bio, interests, socialLinks } = req.body;
    const user = req.user;

    // Update basic info
    if (name) user.name = name;
    if (department) user.profile.department = department;
    if (phone) user.profile.phone = phone;
    if (bio) user.profile.bio = bio;
    if (interests) user.profile.interests = interests;
    if (socialLinks) {
      user.profile.socialLinks = { ...user.profile.socialLinks, ...socialLinks };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
};

// Switch user role
const switchRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const userId = req.user._id;

    if (!newRole) {
      return res.status(400).json({
        message: 'New role is required',
        error: 'Missing role'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User not found'
      });
    }

    if (!user.roles.includes(newRole)) {
      return res.status(400).json({
        message: 'Invalid role',
        error: 'User does not have this role'
      });
    }

    user.currentRole = newRole;
    await user.save();

    res.json({
      message: 'Role switched successfully',
      currentRole: newRole,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole
      }
    });

  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({
      message: 'Failed to switch role',
      error: 'Server error'
    });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const { theme, notifications, language } = req.body;
    const user = req.user;

    if (theme) user.preferences.theme = theme;
    if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    if (language) user.preferences.language = language;

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Preferences update failed' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  switchRole,
  updatePreferences
};
