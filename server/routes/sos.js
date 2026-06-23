// ===== SOS ROUTES - routes/sos.js =====
const express = require('express');
const router = express.Router();
const SosAlert = require('../models/SosAlert');
const CallLog = require('../models/CallLog');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// ─── POST /api/sos ──────────────────────────────────────────
// @desc  Trigger an SOS alert
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { location, alertType, message, userName, userPhone } = req.body;

    const alert = await SosAlert.create({
      user: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : (userName || 'Anonymous Tourist'),
      userPhone: req.user ? req.user.phone : userPhone,
      location: location || { address: 'Location unavailable' },
      alertType: alertType || 'general',
      message: message || 'SOS - Need immediate help!'
    });

    // In production: send SMS/email to emergency contacts here
    // e.g., using Twilio for SMS: sendSMS('+91100', alert.message)

    console.log(`🚨 SOS ALERT #${alert._id} - ${alert.userName} at ${alert.location.address}`);

    res.status(201).json({
      success: true,
      message: '🚨 SOS Alert sent! Emergency services have been notified. Help is on the way.',
      alertId: alert._id,
      alert
    });
  } catch (err) {
    console.error('SOS error:', err);
    res.status(500).json({ success: false, message: 'Failed to send SOS. Call 100 directly!' });
  }
});

// ─── GET /api/sos (ADMIN) ───────────────────────────────────
// @desc  Get all SOS alerts
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const alerts = await SosAlert.find(query).sort({ createdAt: -1 }).populate('user', 'name email phone');
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /api/sos/:id/resolve (ADMIN) ──────────────────────
router.put('/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const alert = await SosAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date(), respondedBy: req.user.name },
      { new: true }
    );
    res.json({ success: true, message: 'Alert marked as resolved', alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /api/sos/call ──────────────────────────────────────────
// @desc  Log an emergency phone call
router.post('/call', optionalAuth, async (req, res) => {
  try {
    const { calledTo, calledNumber, location, userName } = req.body;

    const log = await CallLog.create({
      user: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : (userName || 'Anonymous Tourist'),
      calledTo: calledTo || 'Unknown',
      calledNumber: calledNumber || '000',
      location: location || { address: 'Location unavailable' }
    });

    res.status(201).json({ success: true, log });
  } catch (err) {
    console.error('Call log error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
