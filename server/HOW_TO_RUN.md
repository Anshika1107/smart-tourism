# 🗄️ DATABASE GUIDE — Smart Tourism Indore

## WHERE IS THE DATABASE?

The database is a **real file** that gets created when you run the seed command:

```
server/
└── data/
    └── smart_tourism.db    ← THIS IS YOUR DATABASE FILE
```

It gets created automatically. You don't need to install anything extra.

---

## ✅ STEP-BY-STEP SETUP

### Step 1 — Install Node.js
Download from: https://nodejs.org  (choose LTS version)

### Step 2 — Open VS Code Terminal
```
Ctrl + ` (backtick)  ← Opens terminal in VS Code
```

### Step 3 — Go to server folder
```bash
cd server
```

### Step 4 — Install packages
```bash
npm install
```
This installs Express, SQLite, JWT, bcrypt etc.

### Step 5 — Create and fill the database
```bash
npm run seed:sqlite
```
This creates `server/data/smart_tourism.db` with sample data.

### Step 6 — Start the server
```bash
npm run dev
```

You'll see:
```
✅  Server:    http://localhost:5000
📁  Database:  .../server/data/smart_tourism.db
```

---

## 👁️ HOW TO SEE THE DATABASE IN VS CODE

1. Install this VS Code extension:
   **"SQLite Viewer"** by Florian Klampfer

2. In VS Code file explorer, click on:
   `server/data/smart_tourism.db`

3. You'll see ALL your tables and data visually — like Excel!

---

## 📊 DATABASE TABLES

| Table           | What it stores              | Rows (after seed) |
|-----------------|-----------------------------|--------------------|
| users           | Registered tourists + admins | 5                 |
| trips           | Travel plans                 | 5                 |
| listings        | Hotels, restaurants etc.     | 16                |
| reviews         | Star ratings + comments      | 0 (add via app)   |
| lost_found      | Lost & found reports         | 6                 |
| sos_alerts      | Emergency SOS triggers       | 3                 |
| notifications   | User notifications           | 5                 |

---

## 🔑 LOGIN CREDENTIALS

| Role   | Email                     | Password     |
|--------|---------------------------|--------------|
| Admin  | admin@smarttourism.in     | admin123     |
| User   | rahul@example.com         | password123  |
| User   | priya@example.com         | password123  |

---

## 🧪 TEST THE API

Open your browser and visit:
- http://localhost:5000/api/health    ← Check server is running
- http://localhost:5000/api/listings  ← See all listings
- http://localhost:5000/api           ← All API endpoints

