# Smart Tourism Indore - Upgraded Source Code Compendium

This document compiles the source code of all new and modified files from the Smart Tourism Indore upgrade project (including Chatbot, Leaflet Interactive Maps, Translation API, SOS call logging, and Trip auto-status).

---

## 📂 1. DATABASE & SERVER MODELS (BACKEND)

### 📄 Model: [CallLog.js](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/server/models/CallLog.js) [NEW]
```javascript
const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    required: true
  },
  calledTo: {
    type: String,
    required: true
  },
  calledNumber: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String, default: 'Location unavailable' }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CallLog', CallLogSchema);
```

---

## 📂 2. SERVER ROUTERS & APP (BACKEND)

### 📄 App entry: [server.js](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/server/server.js) (CORS & Chatbot route registration)
```javascript
// ===== MAIN SERVER - server.js =====
// Smart Tourism Indore - Backend API
// College Minor Project

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// ─── Connect to MongoDB ─────────────────────────────────────
connectDB();

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/trips',      require('./routes/trips'));
app.use('/api/listings',   require('./routes/listings'));
app.use('/api/lost-found', require('./routes/lostFound'));
app.use('/api/sos',        require('./routes/sos'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/chat',       require('./routes/chatbot'));

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🗺 Smart Tourism Indore API is running!',
    version: '1.0.0',
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   🗺  Smart Tourism Indore - Backend API      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\n✅ Server running at: http://localhost:${PORT}`);
});

module.exports = app;
```

### 📄 Router: [chatbot.js](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/server/routes/chatbot.js) [NEW]
```javascript
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
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

module.exports = router;
```

### 📄 Router: [auth.js](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/server/routes/auth.js) (Profile email editing & validation updates)
```javascript
// PUT profile update snippet in routes/auth.js
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, emergencyContacts } = req.body;

    // Check if new email is already taken by someone else
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, emergencyContacts },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

### 📄 Router: [sos.js](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/server/routes/sos.js) (SOS call logger endpoint added)
```javascript
// POST emergency call logging in routes/sos.js
const CallLog = require('../models/CallLog');

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
```

### 📄 Router: [trips.js](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/server/routes/trips.js) (Trip travel dates auto status calculator)
```javascript
// GET /api/trips status update calculations in routes/trips.js
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
```

---

## 📂 3. FRONTEND SOURCE SCRIPTS

### 📄 Script: [app.js](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/js/app.js) (SOS call log + MyMemory Translation API fetch)
```javascript
// callContact and translateText methods in js/app.js

async function callContact(name, num) { 
  showToast(`📞 Calling ${name}: ${num}`, 'info'); 
  let locationData = { address: 'Location unavailable' };
  try {
    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 }));
    locationData = { lat: pos.coords.latitude, lng: pos.coords.longitude, address: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` };
  } catch(err) { console.log('GPS unavailable for call log'); }
  
  try {
    const user = getUser();
    await apiCall('/sos/call', 'POST', { 
      calledTo: name, 
      calledNumber: num, 
      location: locationData, 
      userName: user?.name || 'Tourist' 
    });
  } catch (err) {
    console.error('Failed to log call', err);
  }
  
  window.location.href = `tel:${num}`;
}

async function translateText() {
  const rawInput = document.getElementById('translateInput')?.value?.trim();
  const input = rawInput?.toLowerCase();
  const lang = document.getElementById('targetLang')?.value;
  const output = document.getElementById('translateOutput');
  const box = document.getElementById('translateResultBox');
  if (!rawInput || !output) return;
  if (!lang) { showToast('Please select a target language', 'error'); return; }
  
  output.textContent = 'Translating...';
  if (box) box.classList.remove('hidden');

  let result = demoTranslations[input]?.[lang];
  if (result) {
    output.textContent = result;
    return;
  }

  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawInput)}&langpair=en|${lang}`);
    const data = await response.json();
    if (data && data.responseData && data.responseData.translatedText) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.responseData.translatedText;
      output.textContent = tempDiv.textContent;
    } else {
      throw new Error('Translation API error');
    }
  } catch (err) {
    console.error('Translation error:', err);
    output.textContent = `[Offline translation. Failed to translate "${rawInput}"]`;
    showToast('Translation service error. Try offline words.', 'error');
  }
}
```

---

## 📂 4. FRONTEND PAGES

### 📄 Landing page: [index.html](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/index.html) (Chatbot UI component added)
*Integrated inline chatbot styles, toggle chatbot control buttons, and `/api/chat` communication script.*

### 📄 Page: [explore.html](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/pages/explore.html) (Interactive Leaflet map, scrolling centers, SweetAlert booking)
*Includes Leaflet map initialization, explicit marker pins binding, SweetAlert2 room reservation inputs, and dynamic map panning/focus scrolling when click details.*

### 📄 Page: [profile.html](file:///d:/smart-tourism-indore-fullstack/smart-tourism-indore/pages/profile.html) (Editable email input updates)
*Allows updating user email in settings page, updating user data in localstorage and PUT API headers.*
