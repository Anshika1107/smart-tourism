// ============================================================
// FILE: server/config/seed-sqlite.js
// RUN:  node config/seed-sqlite.js
// PURPOSE: Fill the SQLite database with sample data
// ============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, queries, DB_PATH } = require('./sqlite');

console.log('\n🌱 Seeding SQLite Database...');
console.log(`📁 Database file: ${DB_PATH}\n`);

// ── CLEAR EXISTING DATA ──────────────────────────────────────
db.exec(`
  DELETE FROM notifications;
  DELETE FROM sos_alerts;
  DELETE FROM lost_found;
  DELETE FROM reviews;
  DELETE FROM trips;
  DELETE FROM listings;
  DELETE FROM users;
  -- Reset auto-increment counters
  DELETE FROM sqlite_sequence WHERE name IN ('users','trips','listings','reviews','lost_found','sos_alerts','notifications');
`);
console.log('🗑  Cleared existing data');

// ── SEED USERS ───────────────────────────────────────────────
const salt = bcrypt.genSaltSync(10);
const users = [
  { name: 'Admin User',    email: 'admin@smarttourism.in', password: bcrypt.hashSync('admin123', salt),    phone: '+91 9876500000', role: 'admin'   },
  { name: 'Rahul Sharma',  email: 'rahul@example.com',     password: bcrypt.hashSync('password123', salt), phone: '+91 9876543210', role: 'tourist' },
  { name: 'Priya Singh',   email: 'priya@example.com',     password: bcrypt.hashSync('password123', salt), phone: '+91 9876501234', role: 'tourist' },
  { name: 'David Miller',  email: 'david@tourist.com',     password: bcrypt.hashSync('password123', salt), phone: '+91 9876511111', role: 'tourist' },
  { name: 'Anita Patel',   email: 'anita@example.com',     password: bcrypt.hashSync('password123', salt), phone: '+91 9876522222', role: 'tourist' },
];

const insertUser = db.prepare(`INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)`);
users.forEach(u => insertUser.run(u.name, u.email, u.password, u.phone, u.role));
console.log(`✅ ${users.length} users seeded`);
console.log(`   📧 Admin: admin@smarttourism.in / admin123`);
console.log(`   📧 User:  rahul@example.com / password123`);

// ── SEED TRIPS ───────────────────────────────────────────────
const trips = [
  { user_id:2, name:'Weekend in Indore',      destination:'Rajwada Palace', stops:'Indore,Rajwada,Lal Bagh,Sarafa',           transport:'auto',  date:'2024-12-15', people:2, budget:1500,  notes:'Weekend trip with family',     status:'planned'   },
  { user_id:2, name:'MP Heritage Circuit',    destination:'Ujjain',         stops:'Indore,Ujjain,Omkareshwar,Maheshwar',      transport:'bus',   date:'2024-12-20', people:4, budget:5000,  notes:'3-day pilgrimage tour',        status:'planned'   },
  { user_id:3, name:'Indore Food Tour',       destination:'Chhappan Dukan', stops:'Sarafa,Chhappan Dukan,Old Indore',         transport:'walk',  date:'2024-11-28', people:2, budget:800,   notes:'Street food exploration',      status:'completed' },
  { user_id:4, name:'Indore to Bhopal',       destination:'Bhopal',         stops:'Indore,Dewas,Sehore,Bhopal',              transport:'train', date:'2024-12-10', people:1, budget:1200,  notes:'Business trip',                status:'planned'   },
  { user_id:5, name:'Nature & Waterfalls',    destination:'Patalpani',      stops:'Indore,Mhow,Patalpani,Janapav',           transport:'car',   date:'2024-12-22', people:5, budget:2000,  notes:'Nature escape for New Year',   status:'planned'   },
];

const insertTrip = db.prepare(`INSERT INTO trips (user_id,name,destination,stops,transport,date,people,budget,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?)`);
trips.forEach(t => insertTrip.run(t.user_id, t.name, t.destination, t.stops, t.transport, t.date, t.people, t.budget, t.notes, t.status));
console.log(`✅ ${trips.length} trips seeded`);

// ── SEED LISTINGS ────────────────────────────────────────────
const listings = [
  // HOTELS
  { name:'Sayaji Hotel Indore',    category:'hotel',       description:'5-star luxury hotel with pool, spa, multiple dining options and world-class service.', address:'H/1 Scheme No.54, Vijay Nagar, Indore 452010', area:'Vijay Nagar',   phone:'0731-4200000', price_range:'₹5,000-15,000/night', opening_hours:'24/7',     tags:'Pool,Spa,WiFi,Gym,Restaurant,Bar',     emoji:'🏨', rating:4.7, review_count:1240, lat:22.7303, lng:75.8939, is_featured:1 },
  { name:'Lemon Tree Hotel',       category:'hotel',       description:'Modern 4-star hotel with gym, business centre, and comfortable rooms.', address:'Scheme No.54, AB Road, Indore 452010',              area:'AB Road',       phone:'0731-4666000', price_range:'₹2,500-6,000/night',  opening_hours:'24/7',     tags:'Gym,WiFi,AC,Business,Restaurant',      emoji:'🏩', rating:4.4, review_count:890,  lat:22.7196, lng:75.8577, is_featured:0 },
  { name:'Hotel Shreemaya',        category:'hotel',       description:'Popular 3-star hotel in city centre, walking distance from Rajwada Palace.', address:'RNT Marg, Near GPO, Indore 452001',              area:'City Centre',   phone:'0731-2526666', price_range:'₹1,200-3,000/night',  opening_hours:'24/7',     tags:'WiFi,AC,Restaurant,Parking',           emoji:'🏨', rating:4.1, review_count:650,  lat:22.7205, lng:75.8563, is_featured:0 },
  { name:'Radisson Blu Indore',    category:'hotel',       description:'International 5-star chain hotel with rooftop restaurant and conference facilities.', address:'12 Scheme No.94-C, Ring Road, Indore',       area:'Ring Road',     phone:'0731-6644000', price_range:'₹6,000-18,000/night', opening_hours:'24/7',     tags:'Pool,Spa,WiFi,Gym,Conference,Rooftop', emoji:'🏰', rating:4.8, review_count:980,  lat:22.7394, lng:75.8862, is_featured:1 },

  // RESTAURANTS
  { name:'Sarafa Night Market',    category:'restaurant',  description:'Indore\'s most iconic night food market with 50+ stalls. Joshi Dahi Bada, Shahi Shikanji, Malpua and more!', address:'Sarafa Bazaar, Near Rajwada, Old Indore 452007', area:'Old Indore',    phone:null,           price_range:'₹50-200/person',      opening_hours:'8pm-2am',  tags:'Street Food,Night Market,Veg,Non-Veg', emoji:'🌙', rating:4.9, review_count:5600, lat:22.7179, lng:75.8617, is_featured:1 },
  { name:'Chhappan Dukan',         category:'restaurant',  description:'56-shop food street famous for Bhutte ka kees, poha jalebi, garadu, sabudana khichdi and authentic Indori breakfast.', address:'New Palasia, Indore 452001',                      area:'New Palasia',   phone:null,           price_range:'₹30-150/person',      opening_hours:'7am-10pm', tags:'Street Food,Breakfast,Veg,Snacks',     emoji:'🍱', rating:4.8, review_count:3200, lat:22.7334, lng:75.8812, is_featured:1 },
  { name:'Shree Thali Restaurant', category:'restaurant',  description:'Authentic Malwa unlimited thali with dal bati churma, baati, traditional sweets and seasonal sabzis.', address:'Geeta Bhawan Square, Indore 452001',              area:'Geeta Bhawan',  phone:'0731-2551234', price_range:'₹150-250/person',     opening_hours:'11am-4pm, 7pm-11pm', tags:'Thali,Pure Veg,Traditional,Malwa',  emoji:'🥘', rating:4.5, review_count:980,  lat:22.7228, lng:75.8766, is_featured:0 },
  { name:'Jalsa Restaurant',       category:'restaurant',  description:'Popular family restaurant with North Indian, Chinese and Continental menu. Great ambience and live music on weekends.', address:'Vijay Nagar Square, Indore 452010',              area:'Vijay Nagar',   phone:'0731-4056789', price_range:'₹300-600/person',     opening_hours:'12pm-11pm', tags:'Multi-Cuisine,Family,AC,Music',       emoji:'🍽', rating:4.3, review_count:720,  lat:22.7313, lng:75.8928, is_featured:0 },

  // ATTRACTIONS
  { name:'Rajwada Palace',         category:'attraction',  description:'The iconic 7-story historical palace built by Holkar rulers in 1747. Symbol of Indore\'s royal heritage. Must visit at sunset!', address:'Rajwada Chowk, Old Indore 452007',                area:'Old Indore',    phone:null,           price_range:'Free Entry',          opening_hours:'9am-6pm (Closed Mon)', tags:'Heritage,History,Photography,Holkar', emoji:'🏰', rating:4.8, review_count:2100, lat:22.7176, lng:75.8614, is_featured:1 },
  { name:'Lal Bagh Palace',        category:'attraction',  description:'Magnificent late 19th-century Holkar palace with Italian marble, European architecture, Venetian chandeliers and beautiful gardens.', address:'Lal Bagh Road, Indore 452004',                   area:'Lal Bagh',      phone:null,           price_range:'₹50 (Adults), ₹10 (Children)', opening_hours:'10am-5pm (Closed Mon)', tags:'Heritage,Museum,Gardens,Photography', emoji:'🕌', rating:4.6, review_count:1800, lat:22.7089, lng:75.8639, is_featured:1 },
  { name:'Khajrana Ganesh Temple', category:'attraction',  description:'One of India\'s most famous Ganesh temples. Believed to fulfil all wishes. Over 1 lakh devotees visit during festivals.', address:'Khajrana, Indore 452016',                         area:'Khajrana',      phone:null,           price_range:'Free Entry',          opening_hours:'5am-10pm', tags:'Temple,Spiritual,Religious,Heritage',  emoji:'🛕', rating:4.9, review_count:5200, lat:22.7407, lng:75.9167, is_featured:1 },
  { name:'Patalpani Waterfall',    category:'attraction',  description:'Stunning 300-feet waterfall near Indore. Best in monsoon season. Great picnic spot with trekking trails.', address:'Patalpani, Tehsil Mhow, Indore 453441',           area:'Mhow',          phone:null,           price_range:'Free Entry',          opening_hours:'Open all day', tags:'Waterfall,Nature,Trekking,Picnic',    emoji:'🌊', rating:4.5, review_count:1400, lat:22.5461, lng:75.7858, is_featured:0 },
  { name:'Central Museum Indore',  category:'attraction',  description:'Excellent museum with Parmar and Holkar dynasty artefacts, sculptures, and historical exhibits of Madhya Pradesh.', address:'Agra-Bombay Road, Indore 452001',                  area:'City Centre',   phone:'0731-2701888', price_range:'₹10 (Adults), ₹5 (Children)', opening_hours:'10am-5pm (Closed Mon)', tags:'Museum,History,Heritage,Education',   emoji:'🏛', rating:4.2, review_count:620,  lat:22.7167, lng:75.8681, is_featured:0 },

  // SHOPPING
  { name:'Treasure Island Mall',   category:'shop',        description:'Central Indore\'s biggest mall with 200+ stores, multiplex cinema, food court and entertainment zone.', address:'MG Road, Indore 452001',                            area:'MG Road',       phone:'0731-2556789', price_range:'Free Entry',          opening_hours:'10am-10pm', tags:'Mall,Shopping,Food Court,Cinema',     emoji:'🛍', rating:4.3, review_count:3400, lat:22.7203, lng:75.8681, is_featured:0 },
  { name:'Sarafa Jewelry Market',  category:'shop',        description:'Famous jewelry market with hundreds of shops selling traditional Rajwadi and Maharashtrian gold and silver jewelry.', address:'Sarafa Bazaar, Old Indore 452007',                area:'Old Indore',    phone:null,           price_range:'Varies',              opening_hours:'10am-8pm', tags:'Jewelry,Gold,Silver,Traditional',     emoji:'💍', rating:4.4, review_count:880,  lat:22.7179, lng:75.8617, is_featured:0 },

  // TRANSPORT
  { name:'Indore City Cab Service',category:'transport',   description:'Reliable registered cab service. AC and Non-AC options. Special tourist packages for all Indore and MP attractions.', address:'Old Bus Stand, Indore 452001',                     area:'City Centre',   phone:'0731-2500000', price_range:'₹12/km AC, ₹10/km Non-AC', opening_hours:'24/7', tags:'Cab,AC,Airport,Tourist Package',      emoji:'🚕', rating:4.2, review_count:780,  lat:22.7206, lng:75.8539, is_featured:0 },
  { name:'Indore Bus Stand (ISBT)', category:'transport',  description:'Main bus terminal with services to Bhopal, Ujjain, Omkareshwar, Mumbai, Delhi and all MP cities.', address:'Old Bus Stand, Indore 452001',                     area:'City Centre',   phone:'0731-2460088', price_range:'₹50-500',             opening_hours:'4am-11pm', tags:'Bus,ISBT,Interstate,Local',           emoji:'🚌', rating:3.8, review_count:1100, lat:22.7185, lng:75.8539, is_featured:0 },
];

const insertListing = db.prepare(`INSERT INTO listings (name,category,description,address,area,phone,price_range,opening_hours,tags,emoji,rating,review_count,lat,lng,is_featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
listings.forEach(l => insertListing.run(l.name, l.category, l.description, l.address, l.area, l.phone, l.price_range, l.opening_hours, l.tags, l.emoji, l.rating, l.review_count, l.lat, l.lng, l.is_featured));
console.log(`✅ ${listings.length} listings seeded`);

// ── SEED LOST & FOUND ────────────────────────────────────────
const lostFound = [
  { user_id:2, type:'lost',  item_name:'Blue Nike Backpack',   description:'Blue Nike backpack with Dell laptop, charger, books inside. Very important!',  location:'Rajwada Palace',       date:'2024-11-10', contact_phone:'+91 9876543210', contact_name:'Rahul Sharma', status:'open'     },
  { user_id:3, type:'lost',  item_name:'Brown Leather Wallet', description:'Brown wallet with Aadhar card, driving license, ₹2000 cash and ATM cards.',     location:'Sarafa Bazaar',        date:'2024-11-09', contact_phone:'+91 9876501234', contact_name:'Priya Singh',  status:'resolved' },
  { user_id:null,type:'found',item_name:'iPhone 13',           description:'iPhone 13 with cracked screen in blue case. Found near entrance gate.',         location:'Lal Bagh Palace',      date:'2024-11-11', contact_phone:'+91 9900112233', contact_name:'Security',     status:'open'     },
  { user_id:null,type:'found',item_name:'Ray-Ban Sunglasses',  description:'Black Ray-Ban Aviator sunglasses in original case. Found near food court.',     location:'Treasure Island Mall', date:'2024-11-10', contact_phone:'+91 9988776655', contact_name:'Customer Service', status:'open'  },
  { user_id:4, type:'lost',  item_name:'Passport & Documents', description:'Indian passport, boarding pass and travel documents in blue folder. URGENT.',   location:'Indore Airport',       date:'2024-11-12', contact_phone:'+91 9876511111', contact_name:'David Miller', status:'open'     },
  { user_id:null,type:'found',item_name:'Samsung Galaxy A54',  description:'Black Samsung phone with cracked back cover. Found near Khajrana temple gate.', location:'Khajrana Temple',      date:'2024-11-11', contact_phone:'+91 9911223344', contact_name:'Temple Office',status:'open'     },
];

const insertLF = db.prepare(`INSERT INTO lost_found (user_id,type,item_name,description,location,date,contact_phone,contact_name,status) VALUES (?,?,?,?,?,?,?,?,?)`);
lostFound.forEach(l => insertLF.run(l.user_id, l.type, l.item_name, l.description, l.location, l.date, l.contact_phone, l.contact_name, l.status));
console.log(`✅ ${lostFound.length} lost & found items seeded`);

// ── SEED SOS ALERTS ──────────────────────────────────────────
const sosAlerts = [
  { user_id:2, user_name:'Rahul Sharma', user_phone:'+91 9876543210', lat:22.7176, lng:75.8614, addr:'Rajwada Chowk, Old Indore', alert_type:'safety',  message:'Feeling unsafe, need help', status:'resolved' },
  { user_id:3, user_name:'Priya Singh',  user_phone:'+91 9876501234', lat:22.7303, lng:75.8939, addr:'Vijay Nagar, Indore',        alert_type:'medical', message:'Medical emergency needed',  status:'active'   },
  { user_id:null,user_name:'Tourist',    user_phone:'Unknown',        lat:22.7407, lng:75.9167, addr:'Khajrana Area, Indore',      alert_type:'lost',    message:'Lost in the area',          status:'resolved' },
];

const insertSOS = db.prepare(`INSERT INTO sos_alerts (user_id,user_name,user_phone,location_lat,location_lng,location_addr,alert_type,message,status) VALUES (?,?,?,?,?,?,?,?,?)`);
sosAlerts.forEach(s => insertSOS.run(s.user_id, s.user_name, s.user_phone, s.lat, s.lng, s.addr, s.alert_type, s.message, s.status));
console.log(`✅ ${sosAlerts.length} SOS alerts seeded`);

// ── SEED NOTIFICATIONS ───────────────────────────────────────
const notifications = [
  { user_id:2, title:'Welcome to Smart Tourism Indore!', message:'Your account is ready. Start planning your Indore trip today!', type:'success' },
  { user_id:2, title:'Safety Advisory',                  message:'Avoid Sarafa Bazaar area after 11 PM tonight due to maintenance work.', type:'warning' },
  { user_id:2, title:'Special Hotel Offer',              message:'30% off at Sayaji Hotel this weekend! Book now.', type:'info' },
  { user_id:3, title:'Lost Item Match!',                 message:'A brown wallet matching your report was found at Sarafa. Contact: +91 9900555555', type:'success' },
  { user_id:4, title:'Trip Reminder',                    message:'Your Indore to Bhopal trip is tomorrow. Have a safe journey!', type:'info' },
];

const insertNotif = db.prepare(`INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`);
notifications.forEach(n => insertNotif.run(n.user_id, n.title, n.message, n.type));
console.log(`✅ ${notifications.length} notifications seeded`);

// ── PRINT DATABASE SUMMARY ───────────────────────────────────
console.log('\n════════════════════════════════════════');
console.log('📊 DATABASE SUMMARY');
console.log('════════════════════════════════════════');
const tables = ['users','trips','listings','lost_found','sos_alerts','notifications'];
tables.forEach(t => {
  const count = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get().c;
  console.log(`  ${t.padEnd(20)} ${count} rows`);
});
console.log('════════════════════════════════════════');
console.log(`\n📁 Database file saved at:\n   ${DB_PATH}`);
console.log('\n💡 To VIEW the database visually in VS Code:');
console.log('   1. Install extension: "SQLite Viewer" by Florian Klampfer');
console.log('   2. Open: server/data/smart_tourism.db');
console.log('   3. You\'ll see all tables and data like a spreadsheet!\n');
console.log('🚀 Now run: npm run dev\n');

if (require.main === module) {
  db.close();
}
