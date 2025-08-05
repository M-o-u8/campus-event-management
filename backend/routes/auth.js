const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { resetDatabase, checkDatabase } = require('../utils/dbReset');
const { cleanupDatabase, checkDatabaseHealth } = require('../utils/dbCleanup');

const router = express.Router();


const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};



router.post('/register', async (req, res) => {
    try {
        console.log('🔐 Registration attempt:', req.body);
        
        const { name, email, password, role } = req.body;

      
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                message: 'Missing required fields: name, email, password, role',
                error: 'Validation failed'
            });
        }

        
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Registration failed',
                error: 'Email already exists',
                details: 'An account with this email address already exists. Please use a different email or try logging in.'
            });
        }

        
        const validRoles = ['student', 'organizer', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                message: 'Invalid role. Must be student, organizer, or admin',
                error: 'Invalid role'
            });
        }

        
        const userData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            role: role,
            isActive: true 
        };

        console.log('📝 Creating user with data:', { ...userData, password: '[HIDDEN]' });

        
        const user = new User(userData);
        await user.save();

        console.log('✅ User created successfully:', user._id);

        
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        
        
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
});


router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login attempt:', { email: req.body.email });
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required',
                error: 'Missing credentials'
            });
        }

        
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ 
                message: 'Login failed',
                error: 'Account not found',
                details: `No account found with email: ${email}. Please check your email or register a new account.`
            });
        }

        
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Login failed',
                error: 'Invalid password',
                details: 'The password you entered is incorrect. Please try again.'
            });
        }

        console.log('✅ Login successful for user:', user._id);

        
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: 'Server error',
            details: 'An unexpected error occurred. Please try again.'
        });
    }
});


router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});


router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, department, phone } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        if (name) user.name = name;
        if (department) user.department = department;
        if (phone) user.phone = phone;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Profile update failed' });
    }
});


router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Password change failed' });
    }
});


router.get('/db/status', async (req, res) => {
    try {
        const userCount = await checkDatabase();
        res.json({ 
            message: 'Database status checked',
            userCount,
            status: 'success'
        });
    } catch (error) {
        console.error('Database status check error:', error);
        res.status(500).json({ 
            message: 'Failed to check database status',
            error: error.message 
        });
    }
});

router.post('/db/reset', async (req, res) => {
    try {
        const success = await resetDatabase();
        if (success) {
            res.json({ 
                message: 'Database reset successfully',
                status: 'success'
            });
        } else {
            res.status(500).json({ 
                message: 'Database reset failed',
                status: 'error'
            });
        }
    } catch (error) {
        console.error('Database reset error:', error);
        res.status(500).json({ 
            message: 'Failed to reset database',
            error: error.message 
        });
    }
});


router.post('/db/cleanup', async (req, res) => {
    try {
        const success = await cleanupDatabase();
        if (success) {
            res.json({ 
                message: 'Database cleanup completed successfully',
                status: 'success'
            });
        } else {
            res.status(500).json({ 
                message: 'Database cleanup failed',
                status: 'error'
            });
        }
    } catch (error) {
        console.error('Database cleanup error:', error);
        res.status(500).json({ 
            message: 'Failed to cleanup database',
            error: error.message 
        });
    }
});


router.get('/db/health', async (req, res) => {
    try {
        const health = await checkDatabaseHealth();
        if (health) {
            res.json({ 
                message: 'Database health check completed',
                health,
                status: 'success'
            });
        } else {
            res.status(500).json({ 
                message: 'Database health check failed',
                status: 'error'
            });
        }
    } catch (error) {
        console.error('Database health check error:', error);
        res.status(500).json({ 
            message: 'Failed to check database health',
            error: error.message 
        });
    }
});

module.exports = router; 