const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        
        if (role) {
            query.role = role;
        }

        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
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

        res.json(user);
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
        if (role) user.role = role;
        if (department) user.department = department;
        if (phone) user.phone = phone;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
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
        const students = await User.countDocuments({ role: 'student', isActive: true });
        const organizers = await User.countDocuments({ role: 'organizer', isActive: true });
        const admins = await User.countDocuments({ role: 'admin', isActive: true });

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