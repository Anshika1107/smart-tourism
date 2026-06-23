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
