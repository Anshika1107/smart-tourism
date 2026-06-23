// ===== DATABASE SEEDER - config/seed.js =====
// Run with: node config/seed.js
// This adds sample data to the database so the app looks populated

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Listing = require('../models/Listing');
const LostFound = require('../models/LostFound');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

// ───── SAMPLE DATA ─────────────────────────────────────────

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@smarttourism.in',
    password: 'admin123',
    role: 'admin',
    phone: '+91 9876500000'
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    role: 'tourist',
    phone: '+91 9876543210'
  },
  {
    name: 'Priya Singh',
    email: 'priya@example.com',
    password: 'password123',
    role: 'tourist',
    phone: '+91 9876501234'
  }
];

const sampleListings = [
  // HOTELS
  {
    name: 'Sayaji Hotel Indore',
    category: 'hotel',
    description: '5-star luxury hotel with world-class amenities, spa, multiple dining options, and rooftop pool.',
    address: 'H/1, Scheme No. 54, Vijay Nagar, Indore, MP 452010',
    area: 'Vijay Nagar',
    phone: '0731-4200000',
    priceRange: '₹5,000-15,000/night',
    openingHours: '24/7',
    tags: ['Pool', 'Spa', 'WiFi', 'AC', 'Restaurant', 'Gym'],
    emoji: '🏨',
    rating: 4.7,
    reviewCount: 1240,
    location: { lat: 22.7303, lng: 75.8939 },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Lemon Tree Hotel',
    category: 'hotel',
    description: 'Modern 4-star hotel with comfortable rooms, gym, business facilities, and continental breakfast.',
    address: 'Scheme No. 54, AB Road, Indore, MP 452010',
    area: 'AB Road',
    phone: '0731-4666000',
    priceRange: '₹2,500-6,000/night',
    openingHours: '24/7',
    tags: ['Gym', 'WiFi', 'AC', 'Business Centre'],
    emoji: '🏩',
    rating: 4.4,
    reviewCount: 890,
    location: { lat: 22.7196, lng: 75.8577 },
    isActive: true
  },
  {
    name: 'Hotel Shreemaya',
    category: 'hotel',
    description: 'Popular 3-star hotel in the city centre, close to Rajwada. Good budget option for tourists.',
    address: 'RNT Marg, Near GPO, Indore, MP 452001',
    area: 'City Centre',
    phone: '0731-2526666',
    priceRange: '₹1,200-3,000/night',
    openingHours: '24/7',
    tags: ['WiFi', 'AC', 'Restaurant'],
    emoji: '🏨',
    rating: 4.1,
    reviewCount: 650,
    location: { lat: 22.7205, lng: 75.8563 },
    isActive: true
  },

  // RESTAURANTS
  {
    name: 'Sarafa Night Market',
    category: 'restaurant',
    description: 'Indore\'s most iconic night food market with 50+ street food stalls. A must-visit for every tourist!',
    address: 'Sarafa Bazaar, Near Rajwada, Old Indore, MP 452007',
    area: 'Old Indore',
    priceRange: '₹50-200/person',
    openingHours: '8pm-2am',
    tags: ['Street Food', 'Night Market', 'Veg', 'Non-Veg'],
    emoji: '🌙',
    rating: 4.9,
    reviewCount: 5600,
    location: { lat: 22.7176, lng: 75.8614 },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Chhappan Dukan',
    category: 'restaurant',
    description: '56-shop food street famous for Bhutte ka kees, poha jalebi, garadu, and Indori breakfast.',
    address: 'Chhappan Dukan, New Palasia, Indore, MP 452001',
    area: 'New Palasia',
    priceRange: '₹30-150/person',
    openingHours: '7am-10pm',
    tags: ['Street Food', 'Breakfast', 'Veg', 'Snacks'],
    emoji: '🍱',
    rating: 4.8,
    reviewCount: 3200,
    location: { lat: 22.7334, lng: 75.8812 },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Shree Thali Restaurant',
    category: 'restaurant',
    description: 'Authentic Malwa cuisine with unlimited thali. Known for dal bati churma and traditional sweets.',
    address: 'Geeta Bhawan Square, Indore, MP 452001',
    area: 'Geeta Bhawan',
    phone: '0731-2551234',
    priceRange: '₹150-250/person',
    openingHours: '11am-4pm, 7pm-11pm',
    tags: ['Thali', 'Pure Veg', 'Traditional', 'Malwa Cuisine'],
    emoji: '🥘',
    rating: 4.5,
    reviewCount: 980,
    location: { lat: 22.7228, lng: 75.8766 },
    isActive: true
  },
  {
    name: 'Jalsa Restaurant',
    category: 'restaurant',
    description: 'Popular family restaurant with North Indian, Chinese, and Continental dishes. Great ambience.',
    address: 'Vijay Nagar Square, Indore, MP 452010',
    area: 'Vijay Nagar',
    phone: '0731-4056789',
    priceRange: '₹300-600/person',
    openingHours: '12pm-11pm',
    tags: ['Multi-Cuisine', 'Family', 'AC', 'Takeaway'],
    emoji: '🍽',
    rating: 4.3,
    reviewCount: 720,
    location: { lat: 22.7313, lng: 75.8928 },
    isActive: true
  },

  // ATTRACTIONS
  {
    name: 'Rajwada Palace',
    category: 'attraction',
    description: 'The iconic 7-story historical palace built by the Holkar rulers. A symbol of Indore\'s royal heritage.',
    address: 'Rajwada Chowk, Old Indore, MP 452007',
    area: 'Old Indore',
    priceRange: 'Free Entry',
    openingHours: '9am-6pm (Closed Monday)',
    tags: ['Heritage', 'History', 'Photography', 'Holkar Dynasty'],
    emoji: '🏰',
    rating: 4.8,
    reviewCount: 2100,
    location: { lat: 22.7176, lng: 75.8614 },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Lal Bagh Palace',
    category: 'attraction',
    description: 'Magnificent late 19th-century palace with Italian marble, European architecture, and beautiful gardens.',
    address: 'Lal Bagh Road, Indore, MP 452004',
    area: 'Lal Bagh',
    priceRange: '₹50 (Adults), ₹10 (Children)',
    openingHours: '10am-5pm (Closed Monday)',
    tags: ['Heritage', 'Museum', 'Gardens', 'Photography'],
    emoji: '🕌',
    rating: 4.6,
    reviewCount: 1800,
    location: { lat: 22.7089, lng: 75.8639 },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Khajrana Ganesh Temple',
    category: 'attraction',
    description: 'One of India\'s most famous Ganesh temples. Believed to fulfil wishes. Thousands of devotees daily.',
    address: 'Khajrana, Indore, MP 452016',
    area: 'Khajrana',
    priceRange: 'Free Entry',
    openingHours: '5am-10pm',
    tags: ['Temple', 'Spiritual', 'Heritage', 'Religious'],
    emoji: '🛕',
    rating: 4.9,
    reviewCount: 5200,
    location: { lat: 22.7407, lng: 75.9167 },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Patalpani Waterfall',
    category: 'attraction',
    description: 'Stunning 300-feet waterfall near Indore. Best visited during and after monsoon season.',
    address: 'Patalpani, Tehsil Mhow, Indore, MP 453441',
    area: 'Mhow',
    priceRange: 'Free Entry',
    openingHours: 'Open all day',
    tags: ['Waterfall', 'Nature', 'Trekking', 'Picnic'],
    emoji: '🌊',
    rating: 4.5,
    reviewCount: 1400,
    location: { lat: 22.5461, lng: 75.7858 },
    isActive: true
  },

  // SHOPPING
  {
    name: 'Treasure Island Mall',
    category: 'shop',
    description: 'Central Indore\'s biggest mall with 200+ stores, multiplex cinema, food court, and entertainment zone.',
    address: 'MG Road, Indore, MP 452001',
    area: 'MG Road',
    phone: '0731-2556789',
    priceRange: 'Free Entry',
    openingHours: '10am-10pm',
    tags: ['Mall', 'Shopping', 'Food Court', 'Entertainment', 'Cinema'],
    emoji: '🛍',
    rating: 4.3,
    reviewCount: 3400,
    location: { lat: 22.7203, lng: 75.8681 },
    isActive: true
  },
  {
    name: 'Sarafa Jewelry Market',
    category: 'shop',
    description: 'Famous jewelry market with hundreds of shops selling traditional Rajwadi and Maharashtrian jewelry.',
    address: 'Sarafa Bazaar, Old Indore, MP 452007',
    area: 'Old Indore',
    priceRange: 'Varies',
    openingHours: '10am-8pm',
    tags: ['Jewelry', 'Gold', 'Silver', 'Traditional', 'Handicrafts'],
    emoji: '💍',
    rating: 4.4,
    reviewCount: 880,
    location: { lat: 22.7179, lng: 75.8617 },
    isActive: true
  },

  // TRANSPORT
  {
    name: 'Indore City Cab Service',
    category: 'transport',
    description: 'Reliable registered cab service covering all tourist spots. AC and Non-AC options available.',
    address: 'Old Bus Stand, Indore, MP 452001',
    area: 'City Centre',
    phone: '0731-2500000',
    priceRange: '₹12/km (AC), ₹10/km (Non-AC)',
    openingHours: '24/7',
    tags: ['Cab', 'AC', 'Airport Transfer', 'Tourist Package'],
    emoji: '🚕',
    rating: 4.2,
    reviewCount: 780,
    location: { lat: 22.7206, lng: 75.8539 },
    isActive: true
  }
];

const sampleLostFound = [
  {
    type: 'lost',
    itemName: 'Blue Nike Backpack',
    description: 'Blue Nike backpack with laptop (Dell) inside. Also has books and charger.',
    location: 'Rajwada Palace',
    date: new Date('2024-11-10'),
    contactPhone: '+91 9876543210',
    contactName: 'Rahul Sharma',
    status: 'open'
  },
  {
    type: 'lost',
    itemName: 'Brown Leather Wallet',
    description: 'Brown wallet with Aadhar card, driving license, and ₹2000 cash.',
    location: 'Sarafa Bazaar',
    date: new Date('2024-11-09'),
    contactPhone: '+91 9876501234',
    contactName: 'Priya Singh',
    status: 'resolved'
  },
  {
    type: 'found',
    itemName: 'iPhone 13',
    description: 'iPhone 13 with cracked screen found near the entrance. Has a blue case.',
    location: 'Lal Bagh Palace',
    date: new Date('2024-11-11'),
    contactPhone: '+91 9900112233',
    contactName: 'Security Guard',
    status: 'open'
  },
  {
    type: 'found',
    itemName: 'Ray-Ban Sunglasses',
    description: 'Black Ray-Ban sunglasses in original case. Found near food court.',
    location: 'Treasure Island Mall',
    date: new Date('2024-11-10'),
    contactPhone: '+91 9988776655',
    contactName: 'Mall Customer Service',
    status: 'open'
  }
];

// ───── SEED FUNCTION ────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑  Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await LostFound.deleteMany({});

    // Seed Users
    console.log('👥 Seeding users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`   ✅ ${createdUsers.length} users created`);
    console.log(`   📧 Admin login: admin@smarttourism.in / admin123`);
    console.log(`   📧 User login:  rahul@example.com / password123`);

    // Seed Listings
    console.log('🏨 Seeding listings...');
    const createdListings = await Listing.create(sampleListings);
    console.log(`   ✅ ${createdListings.length} listings created`);

    // Seed Lost & Found
    console.log('🔍 Seeding lost & found items...');
    const createdLF = await LostFound.create(sampleLostFound);
    console.log(`   ✅ ${createdLF.length} items created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('🚀 Now run: npm run dev\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
