// ============================================================
// FILE: server/config/sqlite-fallback.js
// PURPOSE: A pure JavaScript JSON file-based database fallback
//          to support SQLite queries when better-sqlite3 cannot
//          be compiled or installed locally.
// ============================================================

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'smart_tourism_db.json');

class Statement {
  constructor(db, executor) {
    this.db = db;
    this.executor = executor;
  }

  run(...params) {
    // Flatten params in case they are passed as an array inside array
    const flatParams = Array.isArray(params[0]) ? params[0] : params;
    const result = this.executor(flatParams);
    this.db.save();
    return result;
  }

  get(...params) {
    const flatParams = Array.isArray(params[0]) ? params[0] : params;
    return this.executor(flatParams);
  }

  all(...params) {
    const flatParams = Array.isArray(params[0]) ? params[0] : params;
    return this.executor(flatParams);
  }
}

class JSONDatabase {
  constructor() {
    this.DB_PATH = DB_PATH;
    this.load();
    this.initQueries();
  }

  load() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        this.data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        console.log(`✅ Loaded JSON Database: ${DB_PATH}`);
        return;
      } catch (err) {
        console.error('Error parsing JSON database, re-seeding...', err);
      }
    }

    this.data = {
      users: [],
      trips: [],
      listings: [],
      reviews: [],
      lost_found: [],
      sos_alerts: [],
      notifications: [],
      call_logs: [],
      feedback: []
    };
    this.seed();
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write to JSON database file:', err);
    }
  }

  // Mimic sqlite's pragma & exec
  pragma(sql) {
    return this;
  }

  exec(sql) {
    return this;
  }

  // Mimic sqlite's prepare
  prepare(sql) {
    return createStatement(this, sql);
  }

  seed() {
    console.log('🌱 Seeding JSON Database with default Indore data...');
    const salt = bcrypt.genSaltSync(10);
    const hash = (pw) => bcrypt.hashSync(pw, salt);

    this.data.users = [
      { id: 1, name: 'Admin User', email: 'admin@smarttourism.in', password: hash('admin123'), phone: '+91 9876500000', role: 'admin', is_active: 1, created_at: new Date().toISOString(), emergency_contacts: null },
      { id: 2, name: 'Rahul Sharma', email: 'rahul@example.com', password: hash('password123'), phone: '+91 9876543210', role: 'tourist', is_active: 1, created_at: new Date().toISOString(), emergency_contacts: null },
      { id: 3, name: 'Priya Singh', email: 'priya@example.com', password: hash('password123'), phone: '+91 9876501234', role: 'tourist', is_active: 1, created_at: new Date().toISOString(), emergency_contacts: null },
      { id: 4, name: 'David Miller', email: 'david@tourist.com', password: hash('password123'), phone: '+91 9876511111', role: 'tourist', is_active: 1, created_at: new Date().toISOString(), emergency_contacts: null },
      { id: 5, name: 'Anita Patel', email: 'anita@example.com', password: hash('password123'), phone: '+91 9876522222', role: 'tourist', is_active: 1, created_at: new Date().toISOString(), emergency_contacts: null }
    ];

    this.data.trips = [
      { id: 1, user_id: 2, name: 'Weekend in Indore', destination: 'Rajwada Palace', stops: 'Indore,Rajwada,Lal Bagh,Sarafa', transport: 'auto', date: '2024-12-15', people: 2, budget: 1500, notes: 'Weekend trip with family', status: 'planned', created_at: new Date().toISOString() },
      { id: 2, user_id: 2, name: 'MP Heritage Circuit', destination: 'Ujjain', stops: 'Indore,Ujjain,Omkareshwar,Maheshwar', transport: 'bus', date: '2024-12-20', people: 4, budget: 5000, notes: '3-day pilgrimage tour', status: 'planned', created_at: new Date().toISOString() },
      { id: 3, user_id: 3, name: 'Indore Food Tour', destination: 'Chhappan Dukan', stops: 'Sarafa,Chhappan Dukan,Old Indore', transport: 'walk', date: '2024-11-28', people: 2, budget: 800, notes: 'Street food exploration', status: 'completed', created_at: new Date().toISOString() },
      { id: 4, user_id: 4, name: 'Indore to Bhopal', destination: 'Bhopal', stops: 'Indore,Dewas,Sehore,Bhopal', transport: 'train', date: '2024-12-10', people: 1, budget: 1200, notes: 'Business trip', status: 'planned', created_at: new Date().toISOString() },
      { id: 5, user_id: 5, name: 'Nature & Waterfalls', destination: 'Patalpani', stops: 'Indore,Mhow,Patalpani,Janapav', transport: 'car', date: '2024-12-22', people: 5, budget: 2000, notes: 'Nature escape for New Year', status: 'planned', created_at: new Date().toISOString() }
    ];

    this.data.listings = [
      { id: 1, name: 'Sayaji Hotel Indore', category: 'hotel', description: '5-star luxury hotel with pool, spa, multiple dining options and world-class service.', address: 'H/1 Scheme No.54, Vijay Nagar, Indore 452010', area: 'Vijay Nagar', phone: '0731-4200000', price_range: '₹5,000-15,000/night', opening_hours: '24/7', tags: 'Pool,Spa,WiFi,Gym,Restaurant,Bar', emoji: '🏨', rating: 4.7, review_count: 1240, lat: 22.7303, lng: 75.8939, is_active: 1, is_featured: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Lemon Tree Hotel', category: 'hotel', description: 'Modern 4-star hotel with gym, business centre, and comfortable rooms.', address: 'Scheme No.54, AB Road, Indore 452010', area: 'AB Road', phone: '0731-4666000', price_range: '₹2,500-6,000/night', opening_hours: '24/7', tags: 'Gym,WiFi,AC,Business,Restaurant', emoji: '🏩', rating: 4.4, review_count: 890, lat: 22.7196, lng: 75.8577, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 3, name: 'Hotel Shreemaya', category: 'hotel', description: 'Popular 3-star hotel in city centre, walking distance from Rajwada Palace.', address: 'RNT Marg, Near GPO, Indore 452001', area: 'City Centre', phone: '0731-2526666', price_range: '₹1,200-3,000/night', opening_hours: '24/7', tags: 'WiFi,AC,Restaurant,Parking', emoji: '🏨', rating: 4.1, review_count: 650, lat: 22.7205, lng: 75.8563, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 4, name: 'Radisson Blu Indore', category: 'hotel', description: 'International 5-star chain hotel with rooftop restaurant and conference facilities.', address: '12 Scheme No.94-C, Ring Road, Indore', area: 'Ring Road', phone: '0731-6644000', price_range: '₹6,000-18,000/night', opening_hours: '24/7', tags: 'Pool,Spa,WiFi,Gym,Conference,Rooftop', emoji: '🏰', rating: 4.8, review_count: 980, lat: 22.7394, lng: 75.8862, is_active: 1, is_featured: 1, created_at: new Date().toISOString() },
      { id: 5, name: 'Sarafa Night Market', category: 'restaurant', description: 'Indore\'s most iconic night food market with 50+ stalls. Joshi Dahi Bada, Shahi Shikanji, Malpua and more!', address: 'Sarafa Bazaar, Near Rajwada, Old Indore 452007', area: 'Old Indore', phone: null, price_range: '₹50-200/person', opening_hours: '8pm-2am', tags: 'Street Food,Night Market,Veg,Non-Veg', emoji: '🌙', rating: 4.9, review_count: 5600, lat: 22.7179, lng: 75.8617, is_active: 1, is_featured: 1, created_at: new Date().toISOString() },
      { id: 6, name: 'Chhappan Dukan', category: 'restaurant', description: '56-shop food street famous for Bhutte ka kees, poha jalebi, garadu, sabudana khichdi and authentic Indori breakfast.', address: 'New Palasia, Indore 452001', area: 'New Palasia', phone: null, price_range: '₹30-150/person', opening_hours: '7am-10pm', tags: 'Street Food,Breakfast,Veg,Snacks', emoji: '🍱', rating: 4.8, review_count: 3200, lat: 22.7334, lng: 75.8812, is_active: 1, is_featured: 1, created_at: new Date().toISOString() },
      { id: 7, name: 'Shree Thali Restaurant', category: 'restaurant', description: 'Authentic Malwa unlimited thali with dal bati churma, baati, traditional sweets and seasonal sabzis.', address: 'Geeta Bhawan Square, Indore 452001', area: 'Geeta Bhawan', phone: '0731-2551234', price_range: '₹150-250/person', opening_hours: '11am-4pm, 7pm-11pm', tags: 'Thali,Pure Veg,Traditional,Malwa', emoji: '🥘', rating: 4.5, review_count: 980, lat: 22.7228, lng: 75.8766, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 8, name: 'Jalsa Restaurant', category: 'restaurant', description: 'Popular family restaurant with North Indian, Chinese and Continental menu. Great ambience and live music on weekends.', address: 'Vijay Nagar Square, Indore 452010', area: 'Vijay Nagar', phone: '0731-4056789', price_range: '₹30-600/person', opening_hours: '12pm-11pm', tags: 'Multi-Cuisine,Family,AC,Music', emoji: '🍽', rating: 4.3, review_count: 720, lat: 22.7313, lng: 75.8928, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 9, name: 'Rajwada Palace', category: 'attraction', description: 'The iconic 7-story historical palace built by Holkar rulers in 1747. Symbol of Indore\'s royal heritage. Must visit at sunset!', address: 'Rajwada Chowk, Old Indore 452007', area: 'Old Indore', phone: null, price_range: 'Free Entry', opening_hours: '9am-6pm (Closed Mon)', tags: 'Heritage,History,Photography,Holkar', emoji: '🏰', rating: 4.8, review_count: 2100, lat: 22.7176, lng: 75.8614, is_active: 1, is_featured: 1, created_at: new Date().toISOString() },
      { id: 10, name: 'Lal Bagh Palace', category: 'attraction', description: 'Magnificent late 19th-century Holkar palace with Italian marble, European architecture, Venetian chandeliers and beautiful gardens.', address: 'Lal Bagh Road, Indore 452004', area: 'Lal Bagh', phone: null, price_range: '₹50 (Adults), ₹10 (Children)', opening_hours: '10am-5pm (Closed Mon)', tags: 'Heritage,Museum,Gardens,Photography', emoji: '🕌', rating: 4.6, review_count: 1800, lat: 22.7089, lng: 75.8639, is_active: 1, is_featured: 1, created_at: new Date().toISOString() },
      { id: 11, name: 'Khajrana Ganesh Temple', category: 'attraction', description: 'One of India\'s most famous Ganesh temples. Believed to fulfil all wishes. Over 1 lakh devotees visit during festivals.', address: 'Khajrana, Indore 452016', area: 'Khajrana', phone: null, price_range: 'Free Entry', opening_hours: '5am-10pm', tags: 'Temple,Spiritual,Religious,Heritage', emoji: '🛕', rating: 4.9, review_count: 5200, lat: 22.7407, lng: 75.9167, is_active: 1, is_featured: 1, created_at: new Date().toISOString() },
      { id: 12, name: 'Patalpani Waterfall', category: 'attraction', description: 'Stunning 300-feet waterfall near Indore. Best in monsoon season. Great picnic spot with trekking trails.', address: 'Patalpani, Tehsil Mhow, Indore 453441', area: 'Mhow', phone: null, price_range: 'Free Entry', opening_hours: 'Open all day', tags: 'Waterfall,Nature,Trekking,Picnic', emoji: '🌊', rating: 4.5, review_count: 1400, lat: 22.5461, lng: 75.7858, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 13, name: 'Central Museum Indore', category: 'attraction', description: 'Excellent museum with Parmar and Holkar dynasty artefacts, sculptures, and historical exhibits of Madhya Pradesh.', address: 'Agra-Bombay Road, Indore 452001', area: 'City Centre', phone: '0731-2701888', price_range: '₹10 (Adults), ₹5 (Children)', opening_hours: '10am-5pm (Closed Mon)', tags: 'Museum,History,Heritage,Education', emoji: '🏛', rating: 4.2, review_count: 620, lat: 22.7167, lng: 75.8681, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 14, name: 'Treasure Island Mall', category: 'shop', description: 'Central Indore\'s biggest mall with 200+ stores, multiplex cinema, food court and entertainment zone.', address: 'MG Road, Indore 452001', area: 'MG Road', phone: '0731-2556789', price_range: 'Free Entry', opening_hours: '10am-10pm', tags: 'Mall,Shopping,Food Court,Cinema', emoji: '🛍', rating: 4.3, review_count: 3400, lat: 22.7203, lng: 75.8681, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 15, name: 'Sarafa Jewelry Market', category: 'shop', description: 'Famous jewelry market with hundreds of shops selling traditional Rajwadi and Maharashtrian gold and silver jewelry.', address: 'Sarafa Bazaar, Old Indore 452007', area: 'Old Indore', phone: null, price_range: 'Varies', opening_hours: '10am-8pm', tags: 'Jewelry,Gold,Silver,Traditional', emoji: '💍', rating: 4.4, review_count: 880, lat: 22.7179, lng: 75.8617, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 16, name: 'Indore City Cab Service', category: 'transport', description: 'Reliable registered cab service. AC and Non-AC options. Special tourist packages for all Indore and MP attractions.', address: 'Old Bus Stand, Indore 452001', area: 'City Centre', phone: '0731-2500000', price_range: '₹12/km AC, ₹10/km Non-AC', opening_hours: '24/7', tags: 'Cab,AC,Airport,Tourist Package', emoji: '🚕', rating: 4.2, review_count: 780, lat: 22.7206, lng: 75.8539, is_active: 1, is_featured: 0, created_at: new Date().toISOString() },
      { id: 17, name: 'Indore Bus Stand (ISBT)', category: 'transport', description: 'Main bus terminal with services to Bhopal, Ujjain, Omkareshwar, Mumbai, Delhi and all MP cities.', address: 'Old Bus Stand, Indore 452001', area: 'City Centre', phone: '0731-2460088', price_range: '₹50-500', opening_hours: '4am-11pm', tags: 'Bus,ISBT,Interstate,Local', emoji: '🚌', rating: 3.8, review_count: 1100, lat: 22.7185, lng: 75.8539, is_active: 1, is_featured: 0, created_at: new Date().toISOString() }
    ];

    this.data.lost_found = [
      { id: 1, user_id: 2, type: 'lost', item_name: 'Blue Nike Backpack', description: 'Blue Nike backpack with Dell laptop, charger, books inside. Very important!', location: 'Rajwada Palace', date: '2024-11-10', contact_phone: '+91 9876543210', contact_name: 'Rahul Sharma', status: 'open', created_at: new Date().toISOString() },
      { id: 2, user_id: 3, type: 'lost', item_name: 'Brown Leather Wallet', description: 'Brown wallet with Aadhar card, driving license, ₹2000 cash and ATM cards.', location: 'Sarafa Bazaar', date: '2024-11-09', contact_phone: '+91 9876501234', contact_name: 'Priya Singh', status: 'resolved', created_at: new Date().toISOString() },
      { id: 3, user_id: null, type: 'found', item_name: 'iPhone 13', description: 'iPhone 13 with cracked screen in blue case. Found near entrance gate.', location: 'Lal Bagh Palace', date: '2024-11-11', contact_phone: '+91 9900112233', contact_name: 'Security', status: 'open', created_at: new Date().toISOString() },
      { id: 4, user_id: null, type: 'found', item_name: 'Ray-Ban Sunglasses', description: 'Black Ray-Ban Aviator sunglasses in original case. Found near food court.', location: 'Treasure Island Mall', date: '2024-11-10', contact_phone: '+91 9988776655', contact_name: 'Customer Service', status: 'open', created_at: new Date().toISOString() },
      { id: 5, user_id: 4, type: 'lost', item_name: 'Passport & Documents', description: 'Indian passport, boarding pass and travel documents in blue folder. URGENT.', location: 'Indore Airport', date: '2024-11-12', contact_phone: '+91 9876511111', contact_name: 'David Miller', status: 'open', created_at: new Date().toISOString() },
      { id: 6, user_id: null, type: 'found', item_name: 'Samsung Galaxy A54', description: 'Black Samsung phone with cracked back cover. Found near Khajrana temple gate.', location: 'Khajrana Temple', date: '2024-11-11', contact_phone: '+91 9911223344', contact_name: 'Temple Office', status: 'open', created_at: new Date().toISOString() }
    ];

    this.data.sos_alerts = [
      { id: 1, user_id: 2, user_name: 'Rahul Sharma', user_phone: '+91 9876543210', location_lat: 22.7176, location_lng: 75.8614, location_addr: 'Rajwada Chowk, Old Indore', alert_type: 'safety', message: 'Feeling unsafe, need help', status: 'resolved', responded_by: 'Admin User', resolved_at: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: 2, user_id: 3, user_name: 'Priya Singh', user_phone: '+91 9876501234', location_lat: 22.7303, location_lng: 75.8939, location_addr: 'Vijay Nagar, Indore', alert_type: 'medical', message: 'Medical emergency needed', status: 'active', created_at: new Date().toISOString() },
      { id: 3, user_id: null, user_name: 'Tourist', user_phone: 'Unknown', location_lat: 22.7407, location_lng: 75.9167, location_addr: 'Khajrana Area, Indore', alert_type: 'lost', message: 'Lost in the area', status: 'resolved', responded_by: 'Admin User', resolved_at: new Date().toISOString(), created_at: new Date().toISOString() }
    ];

    this.data.notifications = [
      { id: 1, user_id: 2, title: 'Welcome to Smart Tourism Indore!', message: 'Your account is ready. Start planning your Indore trip today!', type: 'success', is_read: 0, created_at: new Date().toISOString() },
      { id: 2, user_id: 2, title: 'Safety Advisory', message: 'Avoid Sarafa Bazaar area after 11 PM tonight due to maintenance work.', type: 'warning', is_read: 0, created_at: new Date().toISOString() },
      { id: 3, user_id: 2, title: 'Special Hotel Offer', message: '30% off at Sayaji Hotel this weekend! Book now.', type: 'info', is_read: 0, created_at: new Date().toISOString() },
      { id: 4, user_id: 3, title: 'Lost Item Match!', message: 'A brown wallet matching your report was found at Sarafa. Contact: +91 9900555555', type: 'success', is_read: 0, created_at: new Date().toISOString() },
      { id: 5, user_id: 4, title: 'Trip Reminder', message: 'Your Indore to Bhopal trip is tomorrow. Have a safe journey!', type: 'info', is_read: 0, created_at: new Date().toISOString() }
    ];

    this.save();
    console.log('✅ JSON Database seeded successfully.');
  }

  initQueries() {
    this.queries = {
      users: {
        findAll:     this.prepare(`SELECT id,name,email,phone,role,is_active,last_login,emergency_contacts,created_at FROM users ORDER BY created_at DESC`),
        findById:    this.prepare(`SELECT id,name,email,phone,role,is_active,last_login,emergency_contacts,created_at FROM users WHERE id = ?`),
        findByEmail: this.prepare(`SELECT * FROM users WHERE email = ?`),
        create:      this.prepare(`INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)`),
        updateLogin: this.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`),
        updateStatus:this.prepare(`UPDATE users SET is_active = ? WHERE id = ?`),
        updateRole:  this.prepare(`UPDATE users SET role = ? WHERE id = ?`),
        updatePassword: this.prepare(`UPDATE users SET password = ? WHERE email = ?`),
        count:       this.prepare(`SELECT COUNT(*) as total FROM users`),
        countToday:  this.prepare(`SELECT COUNT(*) as total FROM users WHERE date(created_at) = date('now')`),
      },
      trips: {
        findByUser:  this.prepare(`SELECT * FROM trips WHERE user_id = ? ORDER BY date ASC`),
        findById:    this.prepare(`SELECT * FROM trips WHERE id = ?`),
        create:      this.prepare(`INSERT INTO trips (user_id,name,destination,stops,transport,date,end_date,people,budget,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`),
        update:      this.prepare(`UPDATE trips SET name=?,destination=?,stops=?,transport=?,date=?,people=?,budget=?,notes=?,status=? WHERE id=?`),
        delete:      this.prepare(`DELETE FROM trips WHERE id = ?`),
        count:       this.prepare(`SELECT COUNT(*) as total FROM trips`),
        countToday:  this.prepare(`SELECT COUNT(*) as total FROM trips WHERE date(created_at) = date('now')`),
      },
      listings: {
        findAll:     this.prepare(`SELECT * FROM listings WHERE is_active = 1 ORDER BY is_featured DESC, rating DESC`),
        findByCategory: this.prepare(`SELECT * FROM listings WHERE is_active=1 AND category=? ORDER BY is_featured DESC, rating DESC`),
        findById:    this.prepare(`SELECT * FROM listings WHERE id = ?`),
        search:      this.prepare(`SELECT * FROM listings WHERE is_active=1 AND (name LIKE ? OR description LIKE ? OR area LIKE ?) ORDER BY rating DESC`),
        create:      this.prepare(`INSERT INTO listings (name,category,description,address,area,phone,price_range,opening_hours,tags,emoji,rating,review_count,lat,lng,is_featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
        update:      this.prepare(`UPDATE listings SET name=?,category=?,description=?,address=?,area=?,phone=?,price_range=?,opening_hours=?,is_active=? WHERE id=?`),
        updateRating:this.prepare(`UPDATE listings SET rating=?, review_count=? WHERE id=?`),
        count:       this.prepare(`SELECT COUNT(*) as total FROM listings WHERE is_active=1`),
      },
      reviews: {
        findByListing: this.prepare(`SELECT * FROM reviews WHERE listing_id = ? ORDER BY created_at DESC`),
        create:        this.prepare(`INSERT INTO reviews (listing_id,user_id,user_name,rating,comment) VALUES (?,?,?,?,?)`),
        avgByListing:  this.prepare(`SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE listing_id = ?`),
      },
      lostFound: {
        findAll:     this.prepare(`SELECT * FROM lost_found ORDER BY created_at DESC`),
        findByType:  this.prepare(`SELECT * FROM lost_found WHERE type = ? ORDER BY created_at DESC`),
        findByStatus:this.prepare(`SELECT * FROM lost_found WHERE status = ? ORDER BY created_at DESC`),
        findByTypeAndStatus: this.prepare(`SELECT * FROM lost_found WHERE type=? AND status=? ORDER BY created_at DESC`),
        findById:    this.prepare(`SELECT * FROM lost_found WHERE id = ?`),
        create:      this.prepare(`INSERT INTO lost_found (user_id,type,item_name,description,location,date,contact_phone,contact_name) VALUES (?,?,?,?,?,?,?,?)`),
        updateStatus:this.prepare(`UPDATE lost_found SET status = ? WHERE id = ?`),
        delete:      this.prepare(`DELETE FROM lost_found WHERE id = ?`),
        countOpen:   this.prepare(`SELECT COUNT(*) as total FROM lost_found WHERE status='open'`),
      },
      sos: {
        findAll:      this.prepare(`SELECT * FROM sos_alerts ORDER BY created_at DESC`),
        findActive:   this.prepare(`SELECT * FROM sos_alerts WHERE status='active' ORDER BY created_at DESC`),
        findById:     this.prepare(`SELECT * FROM sos_alerts WHERE id = ?`),
        create:       this.prepare(`INSERT INTO sos_alerts (user_id,user_name,user_phone,location_lat,location_lng,location_addr,alert_type,message) VALUES (?,?,?,?,?,?,?,?)`),
        resolve:      this.prepare(`UPDATE sos_alerts SET status='resolved', responded_by=? WHERE id=?`),
        countActive:  this.prepare(`SELECT COUNT(*) as total FROM sos_alerts WHERE status='active'`),
        countToday:   this.prepare(`SELECT COUNT(*) as total FROM sos_alerts WHERE date(created_at)=date('now')`),
      },
      notifications: {
        findByUser:  this.prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`),
        create:      this.prepare(`INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`),
        markRead:    this.prepare(`UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?`),
        countUnread: this.prepare(`SELECT COUNT(*) as total FROM notifications WHERE user_id=? AND is_read=0`),
      },
      callLogs: {
        create: this.prepare(`INSERT INTO call_logs (user_id, user_name, called_to, called_number, location_lat, location_lng, location_addr) VALUES (?,?,?,?,?,?,?)`),
      },
      feedback: {
        create: this.prepare(`INSERT INTO feedback (user_id, name, email, rating, message) VALUES (?,?,?,?,?)`),
      },
    };
  }
}

function createStatement(db, sql) {
  const nSql = sql.replace(/\s+/g, ' ').trim();

  // --- USERS ---
  if (nSql.includes('FROM users ORDER BY created_at DESC')) {
    return new Statement(db, () => {
      return db.data.users.map(u => ({ ...u })).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes('FROM users WHERE id = ?')) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      return db.data.users.find(u => u.id === id);
    });
  }

  if (nSql.includes('FROM users WHERE email = ?')) {
    return new Statement(db, (params) => {
      const email = params[0];
      return db.data.users.find(u => u.email === email);
    });
  }

  if (nSql.includes('INSERT INTO users (name,email,password,phone,role)')) {
    return new Statement(db, (params) => {
      const [name, email, password, phone, role] = params;
      const nextId = db.data.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
      const newUser = {
        id: nextId,
        name,
        email,
        password,
        phone,
        role: role || 'tourist',
        is_active: 1,
        created_at: new Date().toISOString(),
        emergency_contacts: null
      };
      db.data.users.push(newUser);
      return { lastInsertRowid: nextId };
    });
  }

  if (nSql.includes("UPDATE users SET last_login = datetime('now') WHERE id = ?")) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      const user = db.data.users.find(u => u.id === id);
      if (user) user.last_login = new Date().toISOString();
      return { changes: 1 };
    });
  }

  if (nSql.includes('UPDATE users SET is_active = ? WHERE id = ?')) {
    return new Statement(db, (params) => {
      const [isActive, id] = params;
      const user = db.data.users.find(u => u.id === Number(id));
      if (user) user.is_active = Number(isActive);
      return { changes: 1 };
    });
  }

  if (nSql.includes('UPDATE users SET password = ? WHERE email = ?')) {
    return new Statement(db, (params) => {
      const [password, email] = params;
      const user = db.data.users.find(u => u.email === email);
      if (user) user.password = password;
      return { changes: 1 };
    });
  }

  if (nSql.includes('UPDATE users SET role = ? WHERE id = ?')) {
    return new Statement(db, (params) => {
      const [role, id] = params;
      const user = db.data.users.find(u => u.id === Number(id));
      if (user) user.role = role;
      return { changes: 1 };
    });
  }

  if (nSql.includes('SELECT COUNT(*) as total FROM users') && !nSql.includes('created_at')) {
    return new Statement(db, () => {
      return { total: db.data.users.length };
    });
  }

  if (nSql.includes("SELECT COUNT(*) as total FROM users WHERE date(created_at) = date('now')")) {
    return new Statement(db, () => {
      const today = new Date().toISOString().split('T')[0];
      const count = db.data.users.filter(u => u.created_at.startsWith(today)).length;
      return { total: count };
    });
  }

  if (nSql.includes('SELECT id FROM users WHERE email=? AND id != ?')) {
    return new Statement(db, (params) => {
      const [email, id] = params;
      const u = db.data.users.find(user => user.email === email && user.id !== Number(id));
      return u ? { id: u.id } : undefined;
    });
  }

  if (nSql.includes('UPDATE users SET name=?, email=?, phone=?, emergency_contacts=? WHERE id=?')) {
    return new Statement(db, (params) => {
      const [name, email, phone, emergencyContacts, id] = params;
      const user = db.data.users.find(u => u.id === Number(id));
      if (user) {
        user.name = name;
        user.email = email;
        user.phone = phone;
        user.emergency_contacts = emergencyContacts;
      }
      return { changes: 1 };
    });
  }

  if (nSql.includes('UPDATE users SET password=? WHERE id=?')) {
    return new Statement(db, (params) => {
      const [password, id] = params;
      const user = db.data.users.find(u => u.id === Number(id));
      if (user) user.password = password;
      return { changes: 1 };
    });
  }

  // --- TRIPS ---
  if (nSql.includes('SELECT * FROM trips WHERE user_id = ? ORDER BY date ASC')) {
    return new Statement(db, (params) => {
      const userId = Number(params[0]);
      return db.data.trips.filter(t => t.user_id === userId).sort((a,b) => new Date(a.date) - new Date(b.date));
    });
  }

  if (nSql.includes('SELECT * FROM trips WHERE id = ?') || nSql.includes('SELECT * FROM trips WHERE id=?')) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      return db.data.trips.find(t => t.id === id);
    });
  }

  if (nSql.includes('INSERT INTO trips')) {
    return new Statement(db, (params) => {
      const [userId, name, destination, stops, transport, date, endDate, people, budget, notes, status] = params;
      const nextId = db.data.trips.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      const newTrip = {
        id: nextId,
        user_id: Number(userId),
        name,
        destination,
        stops,
        transport: transport || 'car',
        date,
        end_date: endDate || null,
        people: Number(people || 1),
        budget: Number(budget || 0),
        notes,
        status: status || 'planned',
        created_at: new Date().toISOString()
      };
      db.data.trips.push(newTrip);
      return { lastInsertRowid: nextId };
    });
  }

  if (nSql.includes('UPDATE trips SET name=?,destination=?,stops=?,transport=?,date=?,people=?,budget=?,notes=?,status=? WHERE id=?')) {
    return new Statement(db, (params) => {
      const [name, destination, stops, transport, date, people, budget, notes, status, id] = params;
      const trip = db.data.trips.find(t => t.id === Number(id));
      if (trip) {
        trip.name = name;
        trip.destination = destination;
        trip.stops = stops;
        trip.transport = transport;
        trip.date = date;
        trip.people = Number(people);
        trip.budget = Number(budget);
        trip.notes = notes;
        trip.status = status;
      }
      return { changes: 1 };
    });
  }

  if (nSql.includes('DELETE FROM trips WHERE id = ?')) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      db.data.trips = db.data.trips.filter(t => t.id !== id);
      return { changes: 1 };
    });
  }

  if (nSql.includes('SELECT COUNT(*) as total FROM trips') && !nSql.includes('created_at')) {
    return new Statement(db, () => {
      return { total: db.data.trips.length };
    });
  }

  if (nSql.includes("SELECT COUNT(*) as total FROM trips WHERE date(created_at) = date('now')")) {
    return new Statement(db, () => {
      const today = new Date().toISOString().split('T')[0];
      const count = db.data.trips.filter(t => t.created_at.startsWith(today)).length;
      return { total: count };
    });
  }

  if (nSql.includes('UPDATE trips SET status = ? WHERE id = ?')) {
    return new Statement(db, (params) => {
      const [status, id] = params;
      const trip = db.data.trips.find(t => t.id === Number(id));
      if (trip) trip.status = status;
      return { changes: 1 };
    });
  }

  // --- LISTINGS ---
  if (nSql.includes('SELECT * FROM listings WHERE is_active = 1 ORDER BY is_featured DESC, rating DESC')) {
    return new Statement(db, () => {
      return db.data.listings
        .filter(l => l.is_active === 1)
        .sort((a, b) => {
          if (b.is_featured !== a.is_featured) return b.is_featured - a.is_featured;
          return b.rating - a.rating;
        });
    });
  }

  if (nSql.includes('category=? ORDER BY is_featured DESC, rating DESC')) {
    return new Statement(db, (params) => {
      const category = params[0];
      return db.data.listings
        .filter(l => l.is_active === 1 && l.category === category)
        .sort((a, b) => {
          if (b.is_featured !== a.is_featured) return b.is_featured - a.is_featured;
          return b.rating - a.rating;
        });
    });
  }

  if (nSql.includes('SELECT * FROM listings WHERE id = ?') || nSql.includes('SELECT * FROM listings WHERE id=?')) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      return db.data.listings.find(l => l.id === id);
    });
  }

  if (nSql.includes('name LIKE ? OR description LIKE ? OR area LIKE ?')) {
    return new Statement(db, (params) => {
      const search = params[0].replace(/%/g, '').toLowerCase();
      return db.data.listings
        .filter(l => l.is_active === 1 && (
          l.name.toLowerCase().includes(search) ||
          (l.description || '').toLowerCase().includes(search) ||
          (l.area || '').toLowerCase().includes(search)
        ))
        .sort((a,b) => b.rating - a.rating);
    });
  }

  if (nSql.includes('INSERT INTO listings')) {
    return new Statement(db, (params) => {
      const [name, category, description, address, area, phone, priceRange, openingHours, tags, emoji, rating, reviewCount, lat, lng, isFeatured] = params;
      const nextId = db.data.listings.reduce((max, l) => Math.max(max, l.id), 0) + 1;
      const newListing = {
        id: nextId,
        name,
        category,
        description,
        address,
        area,
        phone,
        price_range: priceRange,
        opening_hours: openingHours,
        tags,
        emoji: emoji || '🏢',
        rating: Number(rating || 0),
        review_count: Number(reviewCount || 0),
        lat: Number(lat || null),
        lng: Number(lng || null),
        is_active: 1,
        is_featured: Number(isFeatured || 0),
        created_at: new Date().toISOString()
      };
      db.data.listings.push(newListing);
      return { lastInsertRowid: nextId };
    });
  }

  if (nSql.includes('UPDATE listings SET name=?,category=?,description=?,address=?,area=?,phone=?,price_range=?,opening_hours=?,is_active=? WHERE id=?')) {
    return new Statement(db, (params) => {
      const [name, category, description, address, area, phone, priceRange, openingHours, isActive, id] = params;
      const l = db.data.listings.find(item => item.id === Number(id));
      if (l) {
        l.name = name;
        l.category = category;
        l.description = description;
        l.address = address;
        l.area = area;
        l.phone = phone;
        l.price_range = priceRange;
        l.opening_hours = openingHours;
        l.is_active = Number(isActive);
      }
      return { changes: 1 };
    });
  }

  if (nSql.includes('UPDATE listings SET rating=?, review_count=? WHERE id=?')) {
    return new Statement(db, (params) => {
      const [rating, reviewCount, id] = params;
      const l = db.data.listings.find(item => item.id === Number(id));
      if (l) {
        l.rating = Number(rating);
        l.review_count = Number(reviewCount);
      }
      return { changes: 1 };
    });
  }

  if (nSql.includes('SELECT COUNT(*) as total FROM listings WHERE is_active=1')) {
    return new Statement(db, () => {
      return { total: db.data.listings.filter(l => l.is_active === 1).length };
    });
  }

  // --- REVIEWS ---
  if (nSql.includes('FROM reviews WHERE listing_id = ? ORDER BY created_at DESC')) {
    return new Statement(db, (params) => {
      const listingId = Number(params[0]);
      return db.data.reviews.filter(r => r.listing_id === listingId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes('INSERT INTO reviews')) {
    return new Statement(db, (params) => {
      const [listingId, userId, userName, rating, comment] = params;
      const nextId = db.data.reviews.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      const newReview = {
        id: nextId,
        listing_id: Number(listingId),
        user_id: userId ? Number(userId) : null,
        user_name: userName,
        rating: Number(rating),
        comment,
        created_at: new Date().toISOString()
      };
      db.data.reviews.push(newReview);
      return { lastInsertRowid: nextId };
    });
  }

  if (nSql.includes('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE listing_id = ?')) {
    return new Statement(db, (params) => {
      const listingId = Number(params[0]);
      const matching = db.data.reviews.filter(r => r.listing_id === listingId);
      if (matching.length === 0) return { avg: 0, cnt: 0 };
      const sum = matching.reduce((s, r) => s + r.rating, 0);
      return { avg: sum / matching.length, cnt: matching.length };
    });
  }

  // --- LOST & FOUND ---
  if (nSql.includes('FROM lost_found ORDER BY created_at DESC') && !nSql.includes('type') && !nSql.includes('status')) {
    return new Statement(db, () => {
      return db.data.lost_found.map(i => ({...i})).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes('FROM lost_found WHERE type = ? ORDER BY created_at DESC')) {
    return new Statement(db, (params) => {
      const type = params[0];
      return db.data.lost_found.filter(lf => lf.type === type).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes('FROM lost_found WHERE status = ? ORDER BY created_at DESC')) {
    return new Statement(db, (params) => {
      const status = params[0];
      return db.data.lost_found.filter(lf => lf.status === status).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes('FROM lost_found WHERE type=? AND status=? ORDER BY created_at DESC')) {
    return new Statement(db, (params) => {
      const [type, status] = params;
      return db.data.lost_found.filter(lf => lf.type === type && lf.status === status).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes('FROM lost_found WHERE id = ?') || nSql.includes('FROM lost_found WHERE id=?')) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      return db.data.lost_found.find(lf => lf.id === id);
    });
  }

  if (nSql.includes('INSERT INTO lost_found')) {
    return new Statement(db, (params) => {
      const [userId, type, itemName, description, location, date, contactPhone, contactName] = params;
      const nextId = db.data.lost_found.reduce((max, lf) => Math.max(max, lf.id), 0) + 1;
      const newItem = {
        id: nextId,
        user_id: userId ? Number(userId) : null,
        type,
        item_name: itemName,
        description,
        location,
        date,
        contact_phone: contactPhone,
        contact_name: contactName,
        status: 'open',
        created_at: new Date().toISOString()
      };
      db.data.lost_found.push(newItem);
      return { lastInsertRowid: nextId };
    });
  }

  if (nSql.includes('UPDATE lost_found SET status = ? WHERE id = ?')) {
    return new Statement(db, (params) => {
      const [status, id] = params;
      const lf = db.data.lost_found.find(item => item.id === Number(id));
      if (lf) lf.status = status;
      return { changes: 1 };
    });
  }

  if (nSql.includes('DELETE FROM lost_found WHERE id = ?')) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      db.data.lost_found = db.data.lost_found.filter(item => item.id !== id);
      return { changes: 1 };
    });
  }

  if (nSql.includes("SELECT COUNT(*) as total FROM lost_found WHERE status='open'")) {
    return new Statement(db, () => {
      return { total: db.data.lost_found.filter(lf => lf.status === 'open').length };
    });
  }

  // --- SOS ALERTS ---
  if (nSql.includes('FROM sos_alerts ORDER BY created_at DESC') && !nSql.includes('status=')) {
    return new Statement(db, () => {
      return db.data.sos_alerts.map(s => ({...s})).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes("FROM sos_alerts WHERE status='active' ORDER BY created_at DESC")) {
    return new Statement(db, () => {
      return db.data.sos_alerts.filter(s => s.status === 'active').sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    });
  }

  if (nSql.includes('FROM sos_alerts WHERE id = ?') || nSql.includes('FROM sos_alerts WHERE id=?')) {
    return new Statement(db, (params) => {
      const id = Number(params[0]);
      return db.data.sos_alerts.find(s => s.id === id);
    });
  }

  if (nSql.includes('INSERT INTO sos_alerts')) {
    return new Statement(db, (params) => {
      const [userId, userName, userPhone, lat, lng, addr, alertType, message] = params;
      const nextId = db.data.sos_alerts.reduce((max, s) => Math.max(max, s.id), 0) + 1;
      const newAlert = {
        id: nextId,
        user_id: userId ? Number(userId) : null,
        user_name: userName,
        user_phone: userPhone,
        location_lat: lat ? Number(lat) : null,
        location_lng: lng ? Number(lng) : null,
        location_addr: addr,
        alert_type: alertType || 'general',
        message: message || 'SOS - Need immediate help!',
        status: 'active',
        created_at: new Date().toISOString()
      };
      db.data.sos_alerts.push(newAlert);
      return { lastInsertRowid: nextId };
    });
  }

  if (nSql.includes("UPDATE sos_alerts SET status='resolved'") || nSql.includes('responded_by=? WHERE id=?')) {
    return new Statement(db, (params) => {
      const [respondedBy, id] = params;
      const alert = db.data.sos_alerts.find(s => s.id === Number(id));
      if (alert) {
        alert.status = 'resolved';
        alert.responded_by = respondedBy;
        alert.resolved_at = new Date().toISOString();
      }
      return { changes: 1 };
    });
  }

  if (nSql.includes("SELECT COUNT(*) as total FROM sos_alerts WHERE status='active'")) {
    return new Statement(db, () => {
      return { total: db.data.sos_alerts.filter(s => s.status === 'active').length };
    });
  }

  if (nSql.includes("SELECT COUNT(*) as total FROM sos_alerts WHERE date(created_at)=date('now')")) {
    return new Statement(db, () => {
      const today = new Date().toISOString().split('T')[0];
      const count = db.data.sos_alerts.filter(s => s.created_at.startsWith(today)).length;
      return { total: count };
    });
  }

  // --- NOTIFICATIONS ---
  if (nSql.includes('FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')) {
    return new Statement(db, (params) => {
      const userId = Number(params[0]);
      return db.data.notifications
        .filter(n => n.user_id === userId)
        .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
    });
  }

  if (nSql.includes('INSERT INTO notifications')) {
    return new Statement(db, (params) => {
      const [userId, title, message, type] = params;
      const nextId = db.data.notifications.reduce((max, n) => Math.max(max, n.id), 0) + 1;
      const newNotif = {
        id: nextId,
        user_id: Number(userId),
        title,
        message,
        type: type || 'info',
        is_read: 0,
        created_at: new Date().toISOString()
      };
      db.data.notifications.push(newNotif);
      return { lastInsertRowid: nextId };
    });
  }

  if (nSql.includes('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?')) {
    return new Statement(db, (params) => {
      const [id, userId] = params;
      const n = db.data.notifications.find(item => item.id === Number(id) && item.user_id === Number(userId));
      if (n) n.is_read = 1;
      return { changes: 1 };
    });
  }

  if (nSql.includes('SELECT COUNT(*) as total FROM notifications WHERE user_id=? AND is_read=0')) {
    return new Statement(db, (params) => {
      const userId = Number(params[0]);
      const count = db.data.notifications.filter(n => n.user_id === userId && n.is_read === 0).length;
      return { total: count };
    });
  }

  // --- CALL LOGS ---
  if (nSql.includes('INSERT INTO call_logs')) {
    return new Statement(db, (params) => {
      const [userId, userName, calledTo, calledNumber, lat, lng, addr] = params;
      const nextId = db.data.call_logs.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      const newCall = {
        id: nextId,
        user_id: userId ? Number(userId) : null,
        user_name: userName,
        called_to: calledTo,
        called_number: calledNumber,
        location_lat: lat ? Number(lat) : null,
        location_lng: lng ? Number(lng) : null,
        location_addr: addr || 'Location unavailable',
        created_at: new Date().toISOString()
      };
      db.data.call_logs.push(newCall);
      return { lastInsertRowid: nextId };
    });
  }

  // --- FEEDBACK ---
  if (nSql.includes('INSERT INTO feedback')) {
    return new Statement(db, (params) => {
      const [userId, name, email, rating, message] = params;
      if (!db.data.feedback) db.data.feedback = [];
      const nextId = db.data.feedback.reduce((max, f) => Math.max(max, f.id), 0) + 1;
      const newFeedback = {
        id: nextId,
        user_id: userId ? Number(userId) : null,
        name,
        email,
        rating: Number(rating),
        message,
        created_at: new Date().toISOString()
      };
      db.data.feedback.push(newFeedback);
      return { lastInsertRowid: nextId };
    });
  }

  // Default fallback for any unhandled queries (to prevent crashing and return basic output)
  console.warn(`[MockDB] Unhandled query matched by default wrapper: ${nSql}`);
  return new Statement(db, (params) => {
    console.log(`[MockDB Executor] SQL: ${nSql}, Params:`, params);
    if (nSql.startsWith('SELECT')) {
      return nSql.includes('COUNT') ? { total: 0 } : [];
    }
    return { lastInsertRowid: 1, changes: 1 };
  });
}

module.exports = JSONDatabase;
