// ===== LISTINGS ROUTES - routes/listings.js =====
const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect, adminOnly } = require('../middleware/auth');

// ─── GET /api/listings ──────────────────────────────────────
// @desc  Get all listings (with optional filters)
// @access Public
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, limit = 20, page = 1 } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await Listing.find(query)
      .sort({ isFeatured: -1, rating: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-reviews'); // Don't send all reviews in list view

    const total = await Listing.countDocuments(query);

    res.json({
      success: true,
      count: listings.length,
      total,
      pages: Math.ceil(total / limit),
      listings
    });
  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/listings/:id ──────────────────────────────────
// @desc  Get single listing with reviews
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /api/listings/:id/review ─────────────────────────
// @desc  Add a review to a listing
// @access Private
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Check if user already reviewed
    const alreadyReviewed = listing.reviews.find(r => r.user?.toString() === req.user.id);
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this listing' });
    }

    listing.reviews.push({
      user: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment
    });

    listing.updateRating();
    await listing.save();

    res.status(201).json({ success: true, message: 'Review added successfully!', rating: listing.rating });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /api/listings (ADMIN) ─────────────────────────────
// @desc  Create a new listing
// @access Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const listing = await Listing.create(req.body);
    res.status(201).json({ success: true, message: 'Listing created!', listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/listings/:id (ADMIN) ──────────────────────────
// @desc  Update a listing
// @access Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, message: 'Listing updated!', listing });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/listings/:id (ADMIN) ───────────────────────
// @desc  Deactivate a listing
// @access Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Listing deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
