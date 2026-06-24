// ============================================================
// FILE: server/config/sqlite.js
// PURPOSE: Creates and manages a real SQLite database FILE
//          stored at: server/data/smart_tourism.db
//          Or falls back to pure JavaScript JSON Database if 
//          better-sqlite3 fails to compile on Windows!
// ============================================================

const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db;
let queries;
let DB_PATH;

try {
  const Database = require('better-sqlite3');
  DB_PATH = path.join(DATA_DIR, 'smart_tourism.db');
  db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log(`✅ SQLite Database (Native): ${DB_PATH}`);

  // Create tables if they don't exist
  db.exec(`
    -- ── USERS TABLE ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      name               TEXT    NOT NULL,
      email              TEXT    NOT NULL UNIQUE,
      password           TEXT    NOT NULL,
      phone              TEXT,
      role               TEXT    DEFAULT 'tourist' CHECK(role IN ('tourist','admin')),
      is_active          INTEGER DEFAULT 1,
      last_login         TEXT,
      emergency_contacts TEXT,
      created_at         TEXT    DEFAULT (datetime('now'))
    );

    -- ── TRIPS TABLE ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS trips (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER REFERENCES users(id),
      name        TEXT    NOT NULL,
      destination TEXT    NOT NULL,
      stops       TEXT,
      transport   TEXT    DEFAULT 'car',
      date        TEXT    NOT NULL,
      end_date    TEXT,
      people      INTEGER DEFAULT 1,
      budget      REAL    DEFAULT 0,
      notes       TEXT,
      status      TEXT    DEFAULT 'planned' CHECK(status IN ('planned','ongoing','completed','cancelled')),
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    -- ── LISTINGS TABLE ───────────────────────────────────────
    CREATE TABLE IF NOT EXISTS listings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      category      TEXT    NOT NULL CHECK(category IN ('hotel','restaurant','attraction','shop','transport')),
      description   TEXT,
      address       TEXT,
      area          TEXT,
      phone         TEXT,
      price_range   TEXT,
      opening_hours TEXT,
      tags          TEXT,
      emoji         TEXT    DEFAULT '🏢',
      rating        REAL    DEFAULT 0,
      review_count  INTEGER DEFAULT 0,
      lat           REAL,
      lng           REAL,
      is_active     INTEGER DEFAULT 1,
      is_featured   INTEGER DEFAULT 0,
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    -- ── REVIEWS TABLE ────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS reviews (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id  INTEGER REFERENCES listings(id) ON DELETE CASCADE,
      user_id     INTEGER REFERENCES users(id),
      user_name   TEXT,
      rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment     TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    -- ── LOST & FOUND TABLE ───────────────────────────────────
    CREATE TABLE IF NOT EXISTS lost_found (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER REFERENCES users(id),
      type          TEXT    NOT NULL CHECK(type IN ('lost','found')),
      item_name     TEXT    NOT NULL,
      description   TEXT,
      location      TEXT    NOT NULL,
      date          TEXT    NOT NULL,
      contact_phone TEXT    NOT NULL,
      contact_name  TEXT,
      status        TEXT    DEFAULT 'open' CHECK(status IN ('open','matched','resolved')),
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    -- ── SOS ALERTS TABLE ─────────────────────────────────────
    CREATE TABLE IF NOT EXISTS sos_alerts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER REFERENCES users(id),
      user_name     TEXT,
      user_phone    TEXT,
      location_lat  REAL,
      location_lng  REAL,
      location_addr TEXT,
      alert_type    TEXT    DEFAULT 'general',
      message       TEXT,
      status        TEXT    DEFAULT 'active' CHECK(status IN ('active','responding','resolved')),
      responded_by  TEXT,
      resolved_at   TEXT,
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    -- ── NOTIFICATIONS TABLE ──────────────────────────────────
    CREATE TABLE IF NOT EXISTS notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER REFERENCES users(id),
      title       TEXT    NOT NULL,
      message     TEXT    NOT NULL,
      type        TEXT    DEFAULT 'info' CHECK(type IN ('info','warning','danger','success')),
      is_read     INTEGER DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    -- ── CALL LOGS TABLE ──────────────────────────────────────
    CREATE TABLE IF NOT EXISTS call_logs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER REFERENCES users(id),
      user_name     TEXT    NOT NULL,
      called_to     TEXT    NOT NULL,
      called_number TEXT    NOT NULL,
      location_lat  REAL,
      location_lng  REAL,
      location_addr TEXT    DEFAULT 'Location unavailable',
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    -- ── FEEDBACK TABLE ───────────────────────────────────────
    CREATE TABLE IF NOT EXISTS feedback (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id),
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      message    TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now'))
    );
  `);

  // Migrate users for emergency contacts if they already exist
  try {
    db.exec("ALTER TABLE users ADD COLUMN emergency_contacts TEXT;");
  } catch (e) {
    // Column already exists or table doesn't exist yet
  }

  // Pre-compiled prepared statement helpers
  queries = {
    users: {
      findAll:     db.prepare(`SELECT id,name,email,phone,role,is_active,last_login,emergency_contacts,created_at FROM users ORDER BY created_at DESC`),
      findById:    db.prepare(`SELECT id,name,email,phone,role,is_active,last_login,emergency_contacts,created_at FROM users WHERE id = ?`),
      findByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
      create:      db.prepare(`INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)`),
      updateLogin: db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`),
      updateStatus:db.prepare(`UPDATE users SET is_active = ? WHERE id = ?`),
      updateRole:  db.prepare(`UPDATE users SET role = ? WHERE id = ?`),
      updatePassword: db.prepare(`UPDATE users SET password = ? WHERE email = ?`),
      count:       db.prepare(`SELECT COUNT(*) as total FROM users`),
      countToday:  db.prepare(`SELECT COUNT(*) as total FROM users WHERE date(created_at) = date('now')`),
    },
    trips: {
      findByUser:  db.prepare(`SELECT * FROM trips WHERE user_id = ? ORDER BY date ASC`),
      findById:    db.prepare(`SELECT * FROM trips WHERE id = ?`),
      create:      db.prepare(`INSERT INTO trips (user_id,name,destination,stops,transport,date,end_date,people,budget,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`),
      update:      db.prepare(`UPDATE trips SET name=?,destination=?,stops=?,transport=?,date=?,people=?,budget=?,notes=?,status=? WHERE id=?`),
      delete:      db.prepare(`DELETE FROM trips WHERE id = ?`),
      count:       db.prepare(`SELECT COUNT(*) as total FROM trips`),
      countToday:  db.prepare(`SELECT COUNT(*) as total FROM trips WHERE date(created_at) = date('now')`),
    },
    listings: {
      findAll:     db.prepare(`SELECT * FROM listings WHERE is_active = 1 ORDER BY is_featured DESC, rating DESC`),
      findByCategory: db.prepare(`SELECT * FROM listings WHERE is_active=1 AND category=? ORDER BY is_featured DESC, rating DESC`),
      findById:    db.prepare(`SELECT * FROM listings WHERE id = ?`),
      search:      db.prepare(`SELECT * FROM listings WHERE is_active=1 AND (name LIKE ? OR description LIKE ? OR area LIKE ?) ORDER BY rating DESC`),
      create:      db.prepare(`INSERT INTO listings (name,category,description,address,area,phone,price_range,opening_hours,tags,emoji,rating,review_count,lat,lng,is_featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
      update:      db.prepare(`UPDATE listings SET name=?,category=?,description=?,address=?,area=?,phone=?,price_range=?,opening_hours=?,is_active=? WHERE id=?`),
      updateRating:db.prepare(`UPDATE listings SET rating=?, review_count=? WHERE id=?`),
      count:       db.prepare(`SELECT COUNT(*) as total FROM listings WHERE is_active=1`),
    },
    reviews: {
      findByListing: db.prepare(`SELECT * FROM reviews WHERE listing_id = ? ORDER BY created_at DESC`),
      create:        db.prepare(`INSERT INTO reviews (listing_id,user_id,user_name,rating,comment) VALUES (?,?,?,?,?)`),
      avgByListing:  db.prepare(`SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE listing_id = ?`),
    },
    lostFound: {
      findAll:     db.prepare(`SELECT * FROM lost_found ORDER BY created_at DESC`),
      findByType:  db.prepare(`SELECT * FROM lost_found WHERE type = ? ORDER BY created_at DESC`),
      findByStatus:db.prepare(`SELECT * FROM lost_found WHERE status = ? ORDER BY created_at DESC`),
      findByTypeAndStatus: db.prepare(`SELECT * FROM lost_found WHERE type=? AND status=? ORDER BY created_at DESC`),
      findById:    db.prepare(`SELECT * FROM lost_found WHERE id = ?`),
      create:      db.prepare(`INSERT INTO lost_found (user_id,type,item_name,description,location,date,contact_phone,contact_name) VALUES (?,?,?,?,?,?,?,?)`),
      updateStatus:db.prepare(`UPDATE lost_found SET status = ? WHERE id = ?`),
      delete:      db.prepare(`DELETE FROM lost_found WHERE id = ?`),
      countOpen:   db.prepare(`SELECT COUNT(*) as total FROM lost_found WHERE status='open'`),
    },
    sos: {
      findAll:      db.prepare(`SELECT * FROM sos_alerts ORDER BY created_at DESC`),
      findActive:   db.prepare(`SELECT * FROM sos_alerts WHERE status='active' ORDER BY created_at DESC`),
      findById:     db.prepare(`SELECT * FROM sos_alerts WHERE id = ?`),
      create:       db.prepare(`INSERT INTO sos_alerts (user_id,user_name,user_phone,location_lat,location_lng,location_addr,alert_type,message) VALUES (?,?,?,?,?,?,?,?)`),
      resolve:      db.prepare(`UPDATE sos_alerts SET status='resolved', resolved_at=datetime('now'), responded_by=? WHERE id=?`),
      countActive:  db.prepare(`SELECT COUNT(*) as total FROM sos_alerts WHERE status='active'`),
      countToday:   db.prepare(`SELECT COUNT(*) as total FROM sos_alerts WHERE date(created_at)=date('now')`),
    },
    notifications: {
      findByUser:  db.prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`),
      create:      db.prepare(`INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`),
      markRead:    db.prepare(`UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?`),
      countUnread: db.prepare(`SELECT COUNT(*) as total FROM notifications WHERE user_id=? AND is_read=0`),
    },
    callLogs: {
      create: db.prepare(`INSERT INTO call_logs (user_id, user_name, called_to, called_number, location_lat, location_lng, location_addr) VALUES (?,?,?,?,?,?,?)`),
    },
    feedback: {
      create: db.prepare(`INSERT INTO feedback (user_id, name, email, rating, message) VALUES (?,?,?,?,?)`),
    },
  };
} catch (err) {
  console.log(`\n⚠️ Native SQLite load failed (better-sqlite3 is missing or failed to compile).`);
  console.log(`💡 Falling back to pure JavaScript JSON Database (JSON File)! No C++ compiler needed.`);
  
  const JSONDatabase = require('./sqlite-fallback');
  const fallback = new JSONDatabase();
  db = fallback;
  queries = fallback.queries;
  DB_PATH = fallback.DB_PATH;
}

module.exports = { db, queries, DB_PATH };
