// ===== TRIP ROUTES - routes/trips.js =====
const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');

// All trip routes require login
router.use(protect);

// ─── GET /api/trips ─────────────────────────────────────────
// @desc  Get all trips of logged-in user
router.get('/', async (req, res) => {
  try {
    let trips = await Trip.find({ user: req.user.id }).sort({ date: 1 });
    
    // Auto-trace trip status based on date
    const now = new Date();
    let updated = false;
    for (let trip of trips) {
      const tripStart = new Date(trip.date);
      let newStatus = trip.status;
      
      // Calculate end date or assume start date if missing
      const tripEnd = trip.endDate ? new Date(trip.endDate) : new Date(tripStart);
      tripEnd.setHours(23, 59, 59, 999); // End of the day
      if (now < tripStart) {
        newStatus = 'planned';
      } else if (now >= tripStart && now <= tripEnd) {
        newStatus = 'ongoing';
      } else if (now > tripEnd) {
        newStatus = 'completed';
      }
      if (newStatus !== trip.status) {
        trip.status = newStatus;
        await trip.save();
        updated = true;
      }
    }
    if (updated) {
      trips = await Trip.find({ user: req.user.id }).sort({ date: 1 });
    }

    res.json({ success: true, count: trips.length, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /api/trips ────────────────────────────────────────
// @desc  Create a new trip
router.post('/', async (req, res) => {
  try {
    const { name, destination, date, endDate, people, budget, notes, itinerary } = req.body;

    if (!name || !destination || !date) {
      return res.status(400).json({ success: false, message: 'Name, destination, and date are required.' });
    }

    const trip = await Trip.create({
      user: req.user.id,
      name, destination, date, endDate,
      people: people || 1,
      budget: budget || 0,
      notes,
      itinerary: itinerary || []
    });

    res.status(201).json({ success: true, message: 'Trip created successfully!', trip });
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/trips/:id ─────────────────────────────────────
// @desc  Get a single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Make sure user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this trip' });
    }

    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /api/trips/:id ─────────────────────────────────────
// @desc  Update a trip
router.put('/:id', async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Trip updated!', trip });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/trips/:id ──────────────────────────────────
// @desc  Delete a trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await trip.deleteOne();
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
