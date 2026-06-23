// ===== ADMIN ROUTES - routes/admin.js =====
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Trip = require('../models/Trip');
const LostFound = require('../models/LostFound');
const SosAlert = require('../models/SosAlert');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require login + admin role
router.use(protect, adminOnly);

// ─── GET /api/admin/stats ───────────────────────────────────
// @desc  Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalListings, totalTrips, activeAlerts, openLostItems] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments({ isActive: true }),
      Trip.countDocuments(),
      SosAlert.countDocuments({ status: 'active' }),
      LostFound.countDocuments({ status: 'open' })
    ]);

    // Users registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const tripsToday = await Trip.countDocuments({ createdAt: { $gte: today } });

    res.json({
      success: true,
      stats: {
        totalUsers, totalListings, totalTrips,
        activeAlerts, openLostItems,
        newUsersToday, tripsToday
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/admin/users ───────────────────────────────────
// @desc  Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /api/admin/users/:id ───────────────────────────────
// @desc  Update user (activate/deactivate, change role)
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive, role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/admin/users/:id ────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    // Don't delete, just deactivate
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
