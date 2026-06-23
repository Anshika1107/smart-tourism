// ===== FEEDBACK ROUTES - routes/feedback.js =====
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const { optionalAuth } = require('../middleware/auth');

// ─── POST /api/feedback ──────────────────────────────────────
// @desc  Submit feedback
// @access Public (optionally authenticated)
router.post('/', [
  optionalAuth,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('message').trim().notEmpty().withMessage('Feedback message is required')
], async (req, res) => {
  // Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, rating, message } = req.body;

  try {
    const feedback = await Feedback.create({
      userId: req.user ? req.user.id : null,
      name,
      email,
      rating: parseInt(rating),
      message
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Thank you for helping us improve Indore Tourism. 🌟',
      feedback
    });
  } catch (err) {
    console.error('Feedback submission error:', err);
    res.status(500).json({ success: false, message: 'Server error. Failed to submit feedback.' });
  }
});

module.exports = router;
