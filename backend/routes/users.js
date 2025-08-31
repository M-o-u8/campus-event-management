const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        
        if (role) {
            query.roles = role;
        }

        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        // Transform users to include profile data in the expected format
        const transformedUsers = users.map(user => ({
            ...user.toObject(),
            department: user.profile?.department,
            phone: user.profile?.phone,
            role: user.currentRole // For backward compatibility
        }));
        res.json(transformedUsers);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});


router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Transform user to include profile data in the expected format
        const transformedUser = {
            ...user.toObject(),
            department: user.profile?.department,
            phone: user.profile?.phone,
            role: user.currentRole // For backward compatibility
        };
        res.json(transformedUser);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});


router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, role, department, phone, isActive } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) {
            if (!user.roles.includes(role)) {
                user.roles.push(role);
            }
            user.currentRole = role;
        }
        if (department || phone) {
            if (!user.profile) user.profile = {};
            if (department) user.profile.department = department;
            if (phone) user.profile.phone = phone;
        }
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                currentRole: user.currentRole,
                department: user.profile?.department,
                phone: user.profile?.phone,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});


router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        user.isActive = false;
        await user.save();

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});


router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const students = await User.countDocuments({ roles: 'student', isActive: true });
        const organizers = await User.countDocuments({ roles: 'organizer', isActive: true });
        const admins = await User.countDocuments({ roles: 'admin', isActive: true });

        res.json({
            totalUsers,
            activeUsers,
            students,
            organizers,
            admins
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
});

module.exports = router; 