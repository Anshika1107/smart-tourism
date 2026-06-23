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
