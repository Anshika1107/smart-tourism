// ============================================================
// FILE: server/server.js
// Smart Tourism Indore — Backend Server (SQLite version)
// All routes are in this one file for simplicity
// ============================================================

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const path      = require('path');

// ── Import our SQLite database ──────────────────────────────
const { db, queries, DB_PATH } = require('./config/sqlite');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'SmartTourismIndore_Secret_2024';

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── SERVE FRONTEND STATIC FILES ──────────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// ── JWT HELPERS ──────────────────────────────────────────────
const makeToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const formatUserForFrontend = (user) => {
  if (!user) return null;
  const safeUser = { ...user };
  if (safeUser.password) delete safeUser.password;
  if (safeUser.emergency_contacts) {
    try {
      safeUser.emergencyContacts = JSON.parse(safeUser.emergency_contacts);
    } catch (e) {
      safeUser.emergencyContacts = [];
    }
    delete safeUser.emergency_contacts;
  } else {
    safeUser.emergencyContacts = [];
  }
  return safeUser;
};

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Login required.' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = queries.users.findById.get(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access required.' });
};

// ============================================================
// ── AUTH ROUTES ──────────────────────────────────────────────
// ============================================================

// POST /api/auth/signup
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password required.' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

  const existing = queries.users.findByEmail.get(email);
  if (existing)
    return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });

  const hashed = bcrypt.hashSync(password, 10);
  const result = queries.users.create.run(name, email, hashed, phone || null, 'tourist');
  const user   = queries.users.findById.get(result.lastInsertRowid);
  const token  = makeToken(user.id);

  res.status(201).json({ success: true, message: `Welcome to Smart Tourism Indore, ${name}! 🎉`, token, user: formatUserForFrontend(user) });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  const user = queries.users.findByEmail.get(email);
  if (!user || !user.is_active)
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  const match = bcrypt.compareSync(password, user.password);
  if (!match)
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  queries.users.updateLogin.run(user.id);
  const token = makeToken(user.id);

  res.json({ success: true, message: `Welcome back, ${user.name}! 👋`, token, user: formatUserForFrontend(user) });
});

// GET /api/auth/me
app.get('/api/auth/me', protect, (req, res) => {
  res.json({ success: true, user: formatUserForFrontend(req.user) });
});

// DELETE /api/auth/me (self-deactivation)
app.delete('/api/auth/me', protect, (req, res) => {
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(0, req.user.id);
  res.json({ success: true, message: 'Account deactivated successfully.' });
});


// PUT /api/auth/profile
app.put('/api/auth/profile', protect, (req, res) => {
  const { name, email, phone, emergencyContacts } = req.body;

  // Validate email if changing
  if (email && email !== req.user.email) {
    const existing = db.prepare('SELECT id FROM users WHERE email=? AND id != ?').get(email, req.user.id);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
    }
  }

  // Convert emergencyContacts array/object to string for SQLite if it's an array/object
  const contactsStr = (emergencyContacts && typeof emergencyContacts === 'object') ? JSON.stringify(emergencyContacts) : (emergencyContacts || null);

  db.prepare('UPDATE users SET name=?, email=?, phone=?, emergency_contacts=? WHERE id=?')
    .run(name || req.user.name, email || req.user.email, phone || null, contactsStr, req.user.id);

  const user = queries.users.findById.get(req.user.id);
  res.json({ success: true, message: 'Profile updated successfully', user: formatUserForFrontend(user) });
});

// PUT /api/auth/change-password
app.put('/api/auth/change-password', protect, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = queries.users.findByEmail.get(req.user.email);
  if (!bcrypt.compareSync(currentPassword, user.password))
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password=? WHERE id=?').run(hashed, user.id);
  res.json({ success: true, message: 'Password changed successfully.' });
});

// POST /api/auth/google
app.post('/api/auth/google', (req, res) => {
  const { credential, profile, password } = req.body;
  let email = profile?.email || 'google.tourist@example.com';

  if (!email) {
    return res.status(400).json({ success: false, message: 'Google Authentication failed: email not retrieved.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  const user = queries.users.findByEmail.get(email);
  if (user) {
    return res.status(400).json({ 
      success: false, 
      message: `Email ${email} is already registered. Please login instead using the login form!` 
    });
  }

  // Create a new user with Google email & password
  const name = profile?.name || email.split('@')[0];
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);

  try {
    const result = queries.users.create.run(name, email, hashed, null, 'tourist');
    const newUser = queries.users.findById.get(result.lastInsertRowid);
    queries.users.updateLogin.run(newUser.id);
    const token = makeToken(newUser.id);

    res.status(201).json({ 
      success: true, 
      message: `Welcome to Smart Tourism Indore, ${newUser.name}! (Registered with Google) 🎉`, 
      token, 
      user: formatUserForFrontend(newUser) 
    });
  } catch (err) {
    console.error('Google registration error:', err);
    res.status(500).json({ success: false, message: 'Failed to create account.' });
  }
});

// POST /api/auth/facebook
app.post('/api/auth/facebook', (req, res) => {
  const { accessToken, profile, password } = req.body;
  let email = profile?.email || 'facebook.tourist@example.com';

  if (!email) {
    return res.status(400).json({ success: false, message: 'Facebook Authentication failed: email not retrieved.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  const user = queries.users.findByEmail.get(email);
  if (user) {
    return res.status(400).json({ 
      success: false, 
      message: `Email ${email} is already registered. Please login instead using the login form!` 
    });
  }

  // Create a new user with Facebook email & password
  const name = profile?.name || email.split('@')[0];
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);

  try {
    const result = queries.users.create.run(name, email, hashed, null, 'tourist');
    const newUser = queries.users.findById.get(result.lastInsertRowid);
    queries.users.updateLogin.run(newUser.id);
    const token = makeToken(newUser.id);

    res.status(201).json({ 
      success: true, 
      message: `Welcome to Smart Tourism Indore, ${newUser.name}! (Registered with Facebook) 🎉`, 
      token, 
      user: formatUserForFrontend(newUser) 
    });
  } catch (err) {
    console.error('Facebook registration error:', err);
    res.status(500).json({ success: false, message: 'Failed to create account.' });
  }
});

// ============================================================
// ── TRIPS ROUTES ─────────────────────────────────────────────
// ============================================================

// GET /api/trips
app.get('/api/trips', protect, (req, res) => {
  let trips = queries.trips.findByUser.all(req.user.id);

  // Auto-calculate trip status based on date
  const now = new Date();
  let updated = false;

  for (let trip of trips) {
    const tripStart = new Date(trip.date);
    let newStatus = trip.status;

    // Calculate end date or assume start date if missing
    const tripEnd = trip.end_date ? new Date(trip.end_date) : new Date(tripStart);
    tripEnd.setHours(23, 59, 59, 999); // End of the day

    if (now < tripStart) {
      newStatus = 'planned';
    } else if (now >= tripStart && now <= tripEnd) {
      newStatus = 'ongoing';
    } else if (now > tripEnd) {
      newStatus = 'completed';
    }

    if (newStatus !== trip.status) {
      db.prepare('UPDATE trips SET status = ? WHERE id = ?').run(newStatus, trip.id);
      updated = true;
    }
  }

  if (updated) {
    trips = queries.trips.findByUser.all(req.user.id);
  }

  res.json({ success: true, count: trips.length, trips });
});

// POST /api/trips
app.post('/api/trips', protect, (req, res) => {
  const { name, destination, stops, transport, date, end_date, people, budget, notes, status } = req.body;
  if (!name || !destination || !date)
    return res.status(400).json({ success: false, message: 'Name, destination and date required.' });

  const result = queries.trips.create.run(
    req.user.id, name, destination,
    stops || null, transport || 'car', date, end_date || null,
    people || 1, budget || 0, notes || null, status || 'planned'
  );
  const trip = queries.trips.findById.get(result.lastInsertRowid);
  res.status(201).json({ success: true, message: 'Trip created! 🗺️', trip });
});

// GET /api/trips/:id
app.get('/api/trips/:id', protect, (req, res) => {
  const trip = queries.trips.findById.get(req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized.' });
  res.json({ success: true, trip });
});

// PUT /api/trips/:id
app.put('/api/trips/:id', protect, (req, res) => {
  const trip = queries.trips.findById.get(req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized.' });

  const { name, destination, stops, transport, date, people, budget, notes, status } = req.body;
  queries.trips.update.run(
    name || trip.name, destination || trip.destination,
    stops !== undefined ? stops : trip.stops,
    transport || trip.transport, date || trip.date,
    people || trip.people, budget || trip.budget,
    notes !== undefined ? notes : trip.notes,
    status || trip.status, trip.id
  );
  res.json({ success: true, message: 'Trip updated!', trip: queries.trips.findById.get(trip.id) });
});

// DELETE /api/trips/:id
app.delete('/api/trips/:id', protect, (req, res) => {
  const trip = queries.trips.findById.get(req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized.' });
  queries.trips.delete.run(trip.id);
  res.json({ success: true, message: 'Trip deleted.' });
});

// ============================================================
// ── LISTINGS ROUTES ──────────────────────────────────────────
// ============================================================

// GET /api/listings
app.get('/api/listings', (req, res) => {
  const { category, search, featured, limit = 20 } = req.query;
  let listings;

  if (search) {
    const q = `%${search}%`;
    listings = queries.listings.search.all(q, q, q);
  } else if (category && category !== 'all') {
    listings = queries.listings.findByCategory.all(category);
  } else {
    listings = queries.listings.findAll.all();
  }

  if (featured === 'true') listings = listings.filter(l => l.is_featured);

  // Parse tags string back to array for frontend
  listings = listings.slice(0, parseInt(limit)).map(l => ({
    ...l,
    tags: l.tags ? l.tags.split(',') : []
  }));

  res.json({ success: true, count: listings.length, listings });
});

// GET /api/listings/:id
app.get('/api/listings/:id', (req, res) => {
  const listing = queries.listings.findById.get(req.params.id);
  if (!listing || !listing.is_active)
    return res.status(404).json({ success: false, message: 'Listing not found.' });

  const reviews = queries.reviews.findByListing.all(listing.id);
  res.json({ success: true, listing: { ...listing, tags: listing.tags?.split(',') || [], reviews } });
});

// POST /api/listings/:id/review
app.post('/api/listings/:id/review', protect, (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ success: false, message: 'Rating must be 1–5.' });

  const listing = queries.listings.findById.get(req.params.id);
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

  queries.reviews.create.run(listing.id, req.user.id, req.user.name, Number(rating), comment || '');

  // Recalculate average rating
  const { avg, cnt } = queries.reviews.avgByListing.get(listing.id);
  queries.listings.updateRating.run(Math.round(avg * 10) / 10, cnt, listing.id);

  res.status(201).json({ success: true, message: 'Review added! ⭐', newRating: Math.round(avg * 10) / 10 });
});

// POST /api/listings (admin)
app.post('/api/listings', protect, adminOnly, (req, res) => {
  const { name, category, description, address, area, phone, price_range, opening_hours, tags, emoji, lat, lng, is_featured } = req.body;
  const result = queries.listings.create.run(name, category, description, address, area, phone, price_range, opening_hours, Array.isArray(tags) ? tags.join(',') : tags, emoji || '🏢', 0, 0, lat, lng, is_featured ? 1 : 0);
  res.status(201).json({ success: true, message: 'Listing created!', id: result.lastInsertRowid });
});

// PUT /api/listings/:id (admin)
app.put('/api/listings/:id', protect, adminOnly, (req, res) => {
  const l = queries.listings.findById.get(req.params.id);
  if (!l) return res.status(404).json({ success: false, message: 'Not found.' });
  const { name, category, description, address, area, phone, price_range, opening_hours, is_active } = req.body;
  queries.listings.update.run(name||l.name, category||l.category, description||l.description, address||l.address, area||l.area, phone||l.phone, price_range||l.price_range, opening_hours||l.opening_hours, is_active !== undefined ? (is_active ? 1 : 0) : l.is_active, l.id);
  res.json({ success: true, message: 'Listing updated.' });
});

// ============================================================
// ── LOST & FOUND ROUTES ──────────────────────────────────────
// ============================================================

// GET /api/lost-found
app.get('/api/lost-found', (req, res) => {
  const { type, status = 'open', search } = req.query;
  let items;

  if (type && status) {
    items = queries.lostFound.findByTypeAndStatus.all(type, status);
  } else if (type) {
    items = queries.lostFound.findByType.all(type);
  } else if (status) {
    items = queries.lostFound.findByStatus.all(status);
  } else {
    items = queries.lostFound.findAll.all();
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.item_name.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      (i.description||'').toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: items.length, items });
});

// POST /api/lost-found
app.post('/api/lost-found', (req, res) => {
  const { type, itemName, item_name, location, date, contactPhone, contact_phone, description, contactName, contact_name } = req.body;
  const iName = itemName || item_name;
  const cPhone = contactPhone || contact_phone;
  const cName = contactName || contact_name;

  if (!type || !iName || !location || !date || !cPhone)
    return res.status(400).json({ success: false, message: 'Type, item name, location, date and contact required.' });

  const result = queries.lostFound.create.run(null, type, iName, description || null, location, date, cPhone, cName || null);
  const item = db.prepare(`SELECT * FROM lost_found WHERE id=?`).get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    message: type === 'lost' ? '😟 Lost item reported! We\'ll notify you if found.' : '😊 Found item reported! Owner will be contacted.',
    item
  });
});

// PUT /api/lost-found/:id/resolve
app.put('/api/lost-found/:id/resolve', protect, (req, res) => {
  const item = queries.lostFound.findById.get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  queries.lostFound.updateStatus.run('resolved', item.id);
  res.json({ success: true, message: '✅ Marked as resolved!' });
});

// DELETE /api/lost-found/:id (admin)
app.delete('/api/lost-found/:id', protect, adminOnly, (req, res) => {
  queries.lostFound.delete.run(req.params.id);
  res.json({ success: true, message: 'Item removed.' });
});

// POST /api/feedback
app.post('/api/feedback', (req, res) => {
  const { name, email, rating, message } = req.body;
  if (!name || !email || !rating || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, rating, and message are required.' });
  }

  // Optional authentication check
  let userId = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      const user = queries.users.findById.get(decoded.id);
      if (user) {
        userId = user.id;
      }
    } catch (err) {}
  }

  try {
    const result = queries.feedback.create.run(userId, name, email, Number(rating), message);
    const feedback = {
      id: result.lastInsertRowid,
      user_id: userId,
      name,
      email,
      rating: Number(rating),
      message,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Thank you for helping us improve Indore Tourism. 🌟',
      feedback
    });
  } catch (err) {
    console.error('Feedback insertion error:', err);
    res.status(500).json({ success: false, message: 'Server error. Failed to submit feedback.' });
  }
});

// ============================================================
// ── SOS ROUTES ───────────────────────────────────────────────
// ============================================================

// POST /api/sos
app.post('/api/sos', (req, res) => {
  const { location, alertType, message, userName, userPhone } = req.body;
  const lat  = location?.lat || null;
  const lng  = location?.lng || null;
  const addr = location?.address || 'Indore, Madhya Pradesh';

  const result = queries.sos.create.run(null, userName || 'Tourist', userPhone || 'Unknown', lat, lng, addr, alertType || 'general', message || 'SOS - Need immediate help!');
  const alert = queries.sos.findById.get(result.lastInsertRowid);

  console.log(`\n🚨🚨 SOS ALERT #${alert.id} — ${alert.user_name} at ${addr}`);

  res.status(201).json({
    success: true,
    message: '🚨 SOS Alert sent! Emergency services have been notified.',
    alertId: alert.id,
    alert
  });
});

// POST /api/sos/call
app.post('/api/sos/call', (req, res) => {
  try {
    const { calledTo, calledNumber, location, userName } = req.body;

    // Optional auth verification
    let userId = null;
    let finalUserName = userName || 'Anonymous Tourist';
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        const user = queries.users.findById.get(decoded.id);
        if (user) {
          userId = user.id;
          finalUserName = user.name;
        }
      } catch (err) {}
    }

    queries.callLogs.create.run(
      userId,
      finalUserName,
      calledTo || 'Unknown',
      calledNumber || '000',
      location?.lat || null,
      location?.lng || null,
      location?.address || 'Location unavailable'
    );

    res.status(201).json({ success: true, message: 'Call logged successfully' });
  } catch (err) {
    console.error('Call logging error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chat
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  const query = message.toLowerCase();
  let reply = "I'm not sure about that. Can you try asking about 'hotels', 'attractions', 'SOS', or 'login'?";

  if (query.includes('hotel') || query.includes('book') || query.includes('stay')) {
    reply = "You can explore and book hotels in Indore by going to the 'Explore' page from the navigation menu.";
  } else if (query.includes('trip') || query.includes('plan')) {
    reply = "Use the 'Plan Trip' page to create an itinerary. I can automatically track your trip status if you provide dates!";
  } else if (query.includes('sos') || query.includes('emergency') || query.includes('help')) {
    reply = "In an emergency, click the red SOS button or go to the Safety page. We will alert authorities and your emergency contacts instantly.";
  } else if (query.includes('login') || query.includes('account') || query.includes('profile')) {
    reply = "You can update your profile and add emergency contacts in the 'Profile' section after logging in.";
  } else if (query.includes('hello') || query.includes('hi')) {
    reply = "Hello! I am the Smart Tourism Indore Assistant. How can I help you today?";
  } else if (query.includes('password')) {
    reply = "You can reset your password from the 'Settings' page.";
  }

  res.json({ success: true, reply });
});

// GET /api/sos (admin)
app.get('/api/sos', protect, adminOnly, (req, res) => {
  const { status } = req.query;
  const alerts = status === 'active'
    ? queries.sos.findActive.all()
    : queries.sos.findAll.all();
  res.json({ success: true, count: alerts.length, alerts });
});

// PUT /api/sos/:id/resolve (admin)
app.put('/api/sos/:id/resolve', protect, adminOnly, (req, res) => {
  queries.sos.resolve.run(req.user.name, req.params.id);
  res.json({ success: true, message: 'Alert resolved.' });
});

// ============================================================
// ── NOTIFICATIONS ROUTES ─────────────────────────────────────
// ============================================================

// GET /api/notifications
app.get('/api/notifications', protect, (req, res) => {
  const items = queries.notifications.findByUser.all(req.user.id);
  const unread = queries.notifications.countUnread.get(req.user.id).total;
  res.json({ success: true, count: items.length, unread, notifications: items });
});

// PUT /api/notifications/:id/read
app.put('/api/notifications/:id/read', protect, (req, res) => {
  queries.notifications.markRead.run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ============================================================
// ── ADMIN ROUTES ─────────────────────────────────────────────
// ============================================================

// GET /api/admin/stats
app.get('/api/admin/stats', protect, adminOnly, (req, res) => {
  const stats = {
    totalUsers:     queries.users.count.get().total,
    totalListings:  queries.listings.count.get().total,
    totalTrips:     queries.trips.count.get().total,
    activeAlerts:   queries.sos.countActive.get().total,
    openLostItems:  queries.lostFound.countOpen.get().total,
    newUsersToday:  queries.users.countToday.get().total,
    tripsToday:     queries.trips.countToday.get().total,
    sosToday:       queries.sos.countToday.get().total,
  };
  res.json({ success: true, stats });
});

// GET /api/admin/users
app.get('/api/admin/users', protect, adminOnly, (req, res) => {
  const users = queries.users.findAll.all();
  res.json({ success: true, count: users.length, users });
});

// PUT /api/admin/users/:id
app.put('/api/admin/users/:id', protect, adminOnly, (req, res) => {
  const { is_active, role } = req.body;
  if (is_active !== undefined) queries.users.updateStatus.run(is_active ? 1 : 0, req.params.id);
  if (role) queries.users.updateRole.run(role, req.params.id);
  const user = queries.users.findById.get(req.params.id);
  res.json({ success: true, message: 'User updated.', user });
});

// ============================================================
// ── HEALTH CHECK & API DOCS ──────────────────────────────────
// ============================================================

app.get('/api/health', (req, res) => {
  const stats = {
    users:    queries.users.count.get().total,
    listings: queries.listings.count.get().total,
    trips:    queries.trips.count.get().total,
  };
  res.json({
    success:   true,
    message:   '🗺 Smart Tourism Indore API is running!',
    database:  `SQLite — ${DB_PATH}`,
    records:   stats,
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Smart Tourism Indore API',
    version: '2.0.0 (SQLite)',
    database: 'SQLite — no installation needed!',
    endpoints: {
      auth:       ['POST /api/auth/signup', 'POST /api/auth/login', 'GET /api/auth/me'],
      trips:      ['GET /api/trips', 'POST /api/trips', 'PUT /api/trips/:id', 'DELETE /api/trips/:id'],
      listings:   ['GET /api/listings', 'GET /api/listings?category=hotel', 'GET /api/listings?search=xyz', 'POST /api/listings/:id/review'],
      lostFound:  ['GET /api/lost-found', 'GET /api/lost-found?type=lost', 'POST /api/lost-found', 'PUT /api/lost-found/:id/resolve'],
      sos:        ['POST /api/sos', 'GET /api/sos (admin)', 'PUT /api/sos/:id/resolve (admin)'],
      admin:      ['GET /api/admin/stats', 'GET /api/admin/users', 'PUT /api/admin/users/:id'],
      notif:      ['GET /api/notifications', 'PUT /api/notifications/:id/read'],
    }
  });
});

app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));

// ── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   🗺  Smart Tourism Indore — Backend Server       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n✅  Server:    http://localhost:${PORT}`);
  console.log(`📋  API Docs:  http://localhost:${PORT}/api`);
  console.log(`🏥  Health:    http://localhost:${PORT}/api/health`);
  console.log(`📁  Database:  ${DB_PATH}`);

  // Auto-seed if database is empty
  try {
    const userCountResult = queries.users.count.get();
    if (!userCountResult || userCountResult.total === 0) {
      console.log('\n🌱 No users found. Automatically seeding sample data...');
      require('./config/seed-sqlite');
    }
  } catch (e) {
    console.log('\n⚠️ Automatic seeding skipped or failed:', e.message);
  }

  console.log(`\n💡  First time? Run this to fill the database:`);
  console.log(`    npm run seed:sqlite\n`);
});

module.exports = app;
