// ===== SOS ALERT MODEL - models/SosAlert.js =====
const mongoose = require('mongoose');

const SosAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  userPhone: String,
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String, default: 'Unknown Location' }
  },
  alertType: {
    type: String,
    enum: ['general', 'medical', 'safety', 'lost', 'fire'],
    default: 'general'
  },
  message: {
    type: String,
    default: 'SOS - Need immediate help!'
  },
  status: {
    type: String,
    enum: ['active', 'responding', 'resolved'],
    default: 'active'
  },
  respondedBy: String,
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SosAlert', SosAlertSchema);
