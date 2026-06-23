// ===== LOST & FOUND ROUTES - routes/lostFound.js =====
const express = require('express');
const router = express.Router();
const LostFound = require('../models/LostFound');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// ─── GET /api/lost-found ────────────────────────────────────
// @desc  Get all lost/found items (public)
router.get('/', async (req, res) => {
  try {
    const { type, status = 'open', search } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await LostFound.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /api/lost-found ───────────────────────────────────
// @desc  Report a lost or found item
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { type, itemName, description, location, date, contactPhone, contactName } = req.body;

    if (!type || !itemName || !location || !date || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Type, item name, location, date, and contact are required.' });
    }

    const item = await LostFound.create({
      user: req.user ? req.user.id : null,
      type, itemName, description, location, date, contactPhone, contactName
    });

    res.status(201).json({ success: true, message: `${type === 'lost' ? '😟 Lost' : '😊 Found'} item reported! We will notify you if there is a match.`, item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /api/lost-found/:id/resolve ───────────────────────
// @desc  Mark item as resolved
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.status = 'resolved';
    await item.save();
    res.json({ success: true, message: '✅ Item marked as resolved!', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/lost-found/:id (ADMIN) ─────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
