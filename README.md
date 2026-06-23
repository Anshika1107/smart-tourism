# 🗺 Smart Tourism Indore
## Full Stack Web Application (SQLite & Zero-Install Fallback Version)

Smart Tourism Indore is a premium, feature-rich full-stack web application designed for tourists visiting Indore, Madhya Pradesh. This project contains modern UX design, interactive itineraries, emergency safety services, and a secure administration panel.

---

## 📁 Project Structure

```
smart-tourism-indore-fff/
│
├── 📄 index.html                  ← Homepage (Hero area, explore buttons)
├── css/
│   └── style.css                  ← Main Stylesheet (Modern color palettes, modals, animations)
├── js/
│   ├── app.js                     ← Unified Frontend API client & OAuth helper
│   ├── i18n.js                    ← Translation/Internationalization toggle
│   └── route.js                   ← Route visualization and Google Maps connector
├── pages/
│   ├── login.html                 ← Sign In / Register Card
│   ├── google-login.html          ← [NEW] Simulated Google OAuth Sign-in form
│   ├── facebook-login.html        ← [NEW] Simulated Facebook OAuth Login form
│   ├── dashboard.html             ← Main User Dashboard
│   ├── trip-planner.html          ← Interactive Itinerary & Route planner
│   ├── explore.html               ← Local Listings, Hotels, & Restaurants
│   ├── sos.html                   ← SOS Emergency Contact Dialer
│   ├── lost-found.html            ← Community Lost & Found items registry
│   ├── translation.html           ← Real-time local translation (mymemory API)
│   ├── settings.html              ← Password reset & user configuration
│   └── admin.html                 ← [SECURED] Admin Panel (Manage Users, Feedbacks, Alerts)
│
└── server/                        ← 🔧 NODE.JS BACKEND
    ├── server.js                  ← Express.js main router (SQLite integration)
    ├── package.json               ← Backend dependencies
    ├── .env                       ← Secret keys & configurations
    ├── data/
    │   └── smart_tourism_db.json  ← JSON DB File (Fallback database)
    └── config/
        ├── sqlite.js              ← Native SQLite table definitions
        └── sqlite-fallback.js     ← Pure JS fallback DB executor (Zero-Install)
```

---

## ⚙️ Tech Stack

| Layer      | Technology          | Description |
|------------|---------------------|-------------|
| **Frontend** | HTML5, Vanilla CSS3, JavaScript (ES6) | Responsive, vibrant UI, and smooth glassmorphic effects. |
| **Backend**  | Node.js + Express.js | Core API routing and protection middleware. |
| **Database** | SQLite / JSON Database | Auto-detects native SQLite (`better-sqlite3`). Falls back to pure JS JSON database if compile drivers are missing. **Zero database server installation needed!** |
| **Security** | JWT (JSON Web Tokens) + BcryptJS | Secure profile sessions and passwords encryption. |

---

## 🚀 How to Run (Step-by-Step)

### STEP 1 – Open the Frontend
The frontend features can fall back to offline simulation in `localStorage` if the backend is offline.
1. Open this directory in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server**.
4. Website opens at `http://127.0.0.1:5500`.

### STEP 2 – Start the Node.js Server
No database setup is required. The system will automatically build the DB tables and load mock data on first launch.

```bash
# 1. Install dependencies from the project root
npm run setup

# 2. Start the development server
npm run dev
```

You should see:
```
✅ Loaded JSON Database: .../server/data/smart_tourism_db.json
╔══════════════════════════════════════════════════╗
║   🗺  Smart Tourism Indore — Backend Server       ║
╚══════════════════════════════════════════════════╝
✅  Server:    http://localhost:5000
📋  API Docs:  http://localhost:5000/api
📁  Database:  SQLite/JSON Database
```

---

## 🔐 Test Accounts & Admin Credentials

| Role | Email | Password | Access Details |
|------|-------|----------|----------------|
| **Admin** | `admin@smarttourism.in` | `admin123` | Log in to access the Admin Panel, or access [admin.html](http://localhost:5000/pages/admin.html) directly and enter `admin123` at the security prompt. |
| **User** | `rahul@example.com` | `password123` | Test tourist account. |
| **User** | `priya@example.com` | `password123` | Test tourist account. |

---

## 🛠️ Main Features Integrated

1. **Simulated OAuth Sign-Up**: Clicking Google or Facebook on the registration screen opens clean popup mockups where users input credentials. Backend verifies duplicates and hashes passwords before creating profiles.
2. **Interactive Trip Planner**: Create custom itineraries, plan routes between Indore spots, or choose a "Suggested Plan" to automatically build trips. Modal overlays are fully scrollable.
3. **Admin Panel Gate**: Unauthorized users cannot access `admin.html`. Direct hits prompt for the Admin Access Password (`admin123`) and log them in dynamically, blocking general guests.
4. **SOS Dialer & Contact logs**: Emits a simulated distress alarm to emergency teams, prompts direct dialing (`tel:number`) links, and logs emergency events on the server.
