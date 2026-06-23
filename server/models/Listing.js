// ===== LISTING MODEL - models/Listing.js =====
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const ListingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['hotel', 'restaurant', 'attraction', 'shop', 'transport'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  area: {
    type: String  // e.g., "Vijay Nagar", "Old Indore"
  },
  phone: String,
  email: String,
  website: String,
  priceRange: String,   // e.g., "₹500-1000/night", "Free"
  openingHours: String, // e.g., "9am-6pm"
  tags: [String],       // e.g., ["WiFi", "Pool", "AC"]
  emoji: {
    type: String,
    default: '🏢'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [ReviewSchema],
  location: {
    lat: Number,
    lng: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-calculate average rating before save
ListingSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.reviewCount = 0; return; }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Math.round((total / this.reviews.length) * 10) / 10;
  this.reviewCount = this.reviews.length;
};

module.exports = mongoose.model('Listing', ListingSchema);
