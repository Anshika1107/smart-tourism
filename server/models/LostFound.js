// ===== LOST & FOUND MODEL - models/LostFound.js =====
const mongoose = require('mongoose');

const LostFoundSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Type (lost/found) is required']
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required']
  },
  contactName: String,
  status: {
    type: String,
    enum: ['open', 'matched', 'resolved'],
    default: 'open'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostFound'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LostFound', LostFoundSchema);
