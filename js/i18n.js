/* ============================================================
   FILE: js/i18n.js
   PURPOSE: Multi-language translation for Smart Tourism Indore
   HOW IT WORKS:
     - Stores all UI text in English + Hindi in this file
     - Any HTML element with data-i18n="key" gets auto-translated
     - Language toggle button switches between EN / HI
     - Choice is saved in localStorage so it persists across pages
   ============================================================ */

// ─── TRANSLATION DICTIONARY ────────────────────────────────
// Add more keys here if you add new pages / text
const TRANSLATIONS = {

  // ── NAVBAR ──────────────────────────────────────────────
  "nav.home":           { en: "Home",         hi: "होम" },
  "nav.plan":           { en: "Plan Trip",    hi: "यात्रा बनाएं" },
  "nav.explore":        { en: "Explore",      hi: "खोजें" },
  "nav.safety":         { en: "Safety",       hi: "सुरक्षा" },
  "nav.lostfound":      { en: "Lost & Found", hi: "खोया & पाया" },
  "nav.login":          { en: "Login",        hi: "लॉगिन" },
  "nav.signup":         { en: "Sign Up",      hi: "साइन अप" },
  "nav.dashboard":      { en: "Dashboard",    hi: "डैशबोर्ड" },
  "nav.logout":         { en: "Logout",       hi: "लॉगआउट" },

  // ── HOMEPAGE HERO ────────────────────────────────────────
  "hero.badge":         { en: "🏛 Indore, Madhya Pradesh", hi: "🏛 इंदौर, मध्य प्रदेश" },
  "hero.title1":        { en: "Your Smart",   hi: "आपका स्मार्ट" },
  "hero.title2":        { en: "Travel Companion", hi: "यात्रा साथी" },
  "hero.title3":        { en: "for Indore",   hi: "इंदौर के लिए" },
  "hero.subtitle":      { en: "Discover the heart of Madhya Pradesh with AI-powered trip planning, real-time safety alerts, local business discovery, and seamless travel experiences.",
                          hi: "AI-पावर्ड यात्रा प्लानिंग, रियल-टाइम सेफ्टी अलर्ट, लोकल बिज़नेस और बेहतरीन यात्रा अनुभव के साथ मध्य प्रदेश के दिल को खोजें।" },
  "hero.btn.start":     { en: "🚀 Get Started Free", hi: "🚀 मुफ्त शुरू करें" },
  "hero.btn.explore":   { en: "🗺 Explore Indore",   hi: "🗺 इंदौर खोजें" },
  "hero.stat1":         { en: "Attractions Listed",  hi: "आकर्षण सूचीबद्ध" },
  "hero.stat2":         { en: "Happy Travelers",     hi: "खुश यात्री" },
  "hero.stat3":         { en: "Safety Support",      hi: "सुरक्षा सहायता" },

  // ── FEATURES SECTION ────────────────────────────────────
  "feat.label":         { en: "Core Features",  hi: "मुख्य विशेषताएं" },
  "feat.title":         { en: "Everything You Need to Explore Indore", hi: "इंदौर खोजने के लिए सब कुछ" },
  "feat.sub":           { en: "A complete digital companion with all tools to make your Indore trip unforgettable and safe.",
                          hi: "आपकी इंदौर यात्रा को यादगार और सुरक्षित बनाने के लिए एक पूर्ण डिजिटल साथी।" },
  "feat.trip.title":    { en: "Smart Trip Planner",    hi: "स्मार्ट ट्रिप प्लानर" },
  "feat.trip.desc":     { en: "Create personalized itineraries with timing, destinations, and notes. Plan your entire Indore trip in minutes.",
                          hi: "समय, गंतव्य और नोट्स के साथ व्यक्तिगत यात्रा कार्यक्रम बनाएं। मिनटों में अपनी पूरी इंदौर यात्रा की योजना बनाएं।" },
  "feat.sos.title":     { en: "SOS Emergency",         hi: "SOS आपातकाल" },
  "feat.sos.desc":      { en: "One-tap emergency alert that instantly shares your location with police, hospitals, and emergency contacts.",
                          hi: "एक-टैप आपातकालीन अलर्ट जो तुरंत पुलिस, अस्पतालों और आपातकालीन संपर्कों के साथ आपका स्थान साझा करता है।" },
  "feat.trans.title":   { en: "Real-Time Translation",  hi: "रियल-टाइम अनुवाद" },
  "feat.trans.desc":    { en: "Instantly translate text and access common Hindi phrases to communicate effortlessly with locals.",
                          hi: "तुरंत टेक्स्ट अनुवाद करें और स्थानीय लोगों से आसानी से संवाद करने के लिए सामान्य हिंदी वाक्यांश देखें।" },
  "feat.list.title":    { en: "Local Business Discovery", hi: "स्थानीय व्यापार खोज" },
  "feat.list.desc":     { en: "Find the best hotels, restaurants, and shops in Indore with ratings, reviews, and map directions.",
                          hi: "रेटिंग, समीक्षा और मैप दिशाओं के साथ इंदौर में सर्वश्रेष्ठ होटल, रेस्तरां और दुकानें खोजें।" },
  "feat.lf.title":      { en: "Lost & Found",           hi: "खोया & पाया" },
  "feat.lf.desc":       { en: "Report lost belongings or check found items list. Our community helps reunite travelers with their things.",
                          hi: "खोई हुई वस्तुएं रिपोर्ट करें या पाई गई वस्तुओं की सूची देखें। हमारी समुदाय यात्रियों को उनकी चीजें वापस पाने में मदद करती है।" },
  "feat.notif.title":   { en: "Smart Notifications",    hi: "स्मार्ट सूचनाएं" },
  "feat.notif.desc":    { en: "Get real-time alerts for safety advisories, local offers, trip reminders, and weather updates.",
                          hi: "सुरक्षा सलाह, स्थानीय ऑफर, ट्रिप रिमाइंडर और मौसम अपडेट के लिए रियल-टाइम अलर्ट पाएं।" },

  // ── EXPLORE PAGE ────────────────────────────────────────
  "explore.label":      { en: "Discover Indore",    hi: "इंदौर खोजें" },
  "explore.title":      { en: "Explore Local Businesses & Attractions", hi: "स्थानीय व्यापार और आकर्षण खोजें" },
  "explore.sub":        { en: "Find hotels, restaurants, shops, and attractions in Indore with ratings and reviews",
                          hi: "रेटिंग और समीक्षाओं के साथ इंदौर में होटल, रेस्तरां, दुकानें और आकर्षण खोजें" },
  "explore.filter.all": { en: "🌟 All",         hi: "🌟 सभी" },
  "explore.filter.hotel":{ en: "🏨 Hotels",     hi: "🏨 होटल" },
  "explore.filter.rest": { en: "🍽 Restaurants", hi: "🍽 रेस्तरां" },
  "explore.filter.attr": { en: "🏛 Attractions", hi: "🏛 आकर्षण" },
  "explore.filter.shop": { en: "🛍 Shopping",   hi: "🛍 खरीदारी" },
  "explore.filter.trans":{ en: "🚗 Transport",  hi: "🚗 परिवहन" },
  "btn.addtrip":        { en: "Add to Trip",    hi: "यात्रा में जोड़ें" },
  "btn.map":            { en: "📍 Map",         hi: "📍 नक्शा" },
  "btn.booknow":        { en: "Book Now",       hi: "अभी बुक करें" },
  "btn.call":           { en: "📞 Call",        hi: "📞 कॉल" },

  // ── TRIP PLANNER ────────────────────────────────────────
  "trip.title":         { en: "🗺 Trip Planner",   hi: "🗺 ट्रिप प्लानर" },
  "trip.sub":           { en: "Create and manage your Indore travel itineraries", hi: "अपनी इंदौर यात्रा योजनाएं बनाएं और प्रबंधित करें" },
  "trip.btn.new":       { en: "+ Create New Trip", hi: "+ नई यात्रा बनाएं" },
  "trip.tab.mytrips":   { en: "My Trips",           hi: "मेरी यात्राएं" },
  "trip.tab.daily":     { en: "Daily Itinerary",    hi: "दैनिक कार्यक्रम" },
  "trip.tab.suggest":   { en: "Suggested Plans",    hi: "सुझाई योजनाएं" },
  "trip.notrips":       { en: "No trips planned yet. Click \"Create New Trip\" to start!", hi: "अभी कोई यात्रा नहीं। शुरू करने के लिए \"नई यात्रा बनाएं\" पर क्लिक करें!" },
  "trip.modal.title":   { en: "✈️ Create New Trip",  hi: "✈️ नई यात्रा बनाएं" },
  "trip.field.name":    { en: "Trip Name *",         hi: "यात्रा का नाम *" },
  "trip.field.date":    { en: "Travel Date *",       hi: "यात्रा तिथि *" },
  "trip.field.people":  { en: "No. of People",       hi: "लोगों की संख्या" },
  "trip.field.dest":    { en: "Main Destination *",  hi: "मुख्य गंतव्य *" },
  "trip.field.stops":   { en: "Route Stops (comma separated)", hi: "रूट स्टॉप (कॉमा से अलग करें)" },
  "trip.field.budget":  { en: "Budget (₹)",          hi: "बजट (₹)" },
  "trip.field.notes":   { en: "Notes",               hi: "नोट्स" },
  "trip.field.transport":{ en: "Transport Mode",     hi: "परिवहन का तरीका" },
  "btn.save":           { en: "💾 Save Trip",         hi: "💾 यात्रा सहेजें" },
  "btn.cancel":         { en: "Cancel",               hi: "रद्द करें" },
  "btn.route":          { en: "🗺 View Route",         hi: "🗺 रूट देखें" },
  "btn.delete":         { en: "🗑 Delete",             hi: "🗑 हटाएं" },

  // ── TRANSLATION PAGE ────────────────────────────────────
  "trans.label":        { en: "Language Help",    hi: "भाषा सहायता" },
  "trans.title":        { en: "🌍 Translation Assistant", hi: "🌍 अनुवाद सहायक" },
  "trans.sub":          { en: "Translate text and learn common Hindi phrases to communicate with locals in Indore.",
                          hi: "इंदौर में स्थानीय लोगों से संवाद के लिए टेक्स्ट अनुवाद करें और सामान्य हिंदी वाक्यांश सीखें।" },
  "trans.card.title":   { en: "🔤 Text Translator",   hi: "🔤 टेक्स्ट अनुवादक" },
  "trans.from.label":   { en: "Translate From",       hi: "से अनुवाद करें" },
  "trans.to.label":     { en: "Translate To",         hi: "में अनुवाद करें" },
  "trans.btn":          { en: "🌍 Translate",          hi: "🌍 अनुवाद करें" },
  "trans.result.label": { en: "Translation Result:",  hi: "अनुवाद परिणाम:" },
  "trans.copy":         { en: "📋 Copy",               hi: "📋 कॉपी" },
  "trans.phrase.title": { en: "📖 Common Hindi Phrases", hi: "📖 सामान्य हिंदी वाक्यांश" },
  "trans.phrase.sub":   { en: "Tap any phrase to copy the transliteration.", hi: "ट्रांसलिटरेशन कॉपी करने के लिए किसी भी वाक्यांश पर टैप करें।" },

  // ── SOS PAGE ────────────────────────────────────────────
  "sos.title":          { en: "🚨 Emergency SOS",      hi: "🚨 आपातकालीन SOS" },
  "sos.sub":            { en: "In an emergency, press the button below to instantly alert authorities and your emergency contacts.",
                          hi: "आपातकाल में, तुरंत अधिकारियों और आपातकालीन संपर्कों को सचेत करने के लिए नीचे दिए बटन दबाएं।" },
  "sos.contacts.title": { en: "📞 Emergency Contacts – Indore", hi: "📞 आपातकालीन संपर्क – इंदौर" },

  // ── GENERAL ────────────────────────────────────────────
  "general.loading":    { en: "Loading...",    hi: "लोड हो रहा है..." },
  "general.search":     { en: "Search...",     hi: "खोजें..." },
  "general.submit":     { en: "Submit",        hi: "जमा करें" },
  "general.close":      { en: "Close",         hi: "बंद करें" },
};

// ─── LANGUAGE SWITCH ENGINE ────────────────────────────────

const I18N = {
  currentLang: localStorage.getItem('sts_lang') || 'en',

  // Get translated text for a key
  t(key) {
    const entry = TRANSLATIONS[key];
    if (!entry) return key; // Return key if not found
    return entry[this.currentLang] || entry['en'] || key;
  },

  // Apply all translations on the page
  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr'); // For placeholder, title etc.
      const text = this.t(key);
      if (attr) {
        el.setAttribute(attr, text);
      } else {
        el.textContent = text;
      }
    });
    // Update html lang attribute
    document.documentElement.lang = this.currentLang;
    // Update toggle button appearance
    this.updateToggleBtn();
  },

  // Switch language
  switch(lang) {
    this.currentLang = lang;
    localStorage.setItem('sts_lang', lang);
    this.applyAll();
  },

  // Toggle between en and hi
  toggle() {
    this.switch(this.currentLang === 'en' ? 'hi' : 'en');
  },

  // Update the toggle button text/icon
  updateToggleBtn() {
    const btns = document.querySelectorAll('.lang-toggle-btn');
    btns.forEach(btn => {
      if (this.currentLang === 'hi') {
        btn.innerHTML = `<span class="lang-flag">🇮🇳</span> हिंदी`;
        btn.title = 'Switch to English';
      } else {
        btn.innerHTML = `<span class="lang-flag">🇬🇧</span> English`;
        btn.title = 'हिंदी में बदलें';
      }
    });
  }
};

// ─── AUTO-INIT ON PAGE LOAD ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  I18N.applyAll();
});
