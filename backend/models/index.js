const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    budget: { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
    travelStyle: { type: String, enum: ['adventure', 'relaxation', 'cultural', 'business'], default: 'cultural' }
  }
}, { timestamps: true });

// Destination Schema
const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  averageCost: { type: Number },
  bestTimeToVisit: { type: String },
  activities: [{ type: String }],
  accommodations: [{
    name: String,
    type: { type: String, enum: ['hotel', 'hostel', 'apartment', 'resort'] },
    priceRange: String,
    rating: Number
  }],
  rating: { type: Number, min: 1, max: 5, default: 4 }
}, { timestamps: true });

// Itinerary Schema
const itinerarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number },
  days: [{
    day: Number,
    date: Date,
    activities: [{
      time: String,
      activity: String,
      location: String,
      cost: Number,
      notes: String
    }]
  }],
  notes: { type: String },
  status: { type: String, enum: ['planning', 'confirmed', 'completed'], default: 'planning' }
}, { timestamps: true });

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  type: { type: String, enum: ['flight', 'hotel', 'activity', 'transport'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  bookingDate: { type: Date, required: true },
  cost: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  bookingReference: { type: String },
  provider: { type: String },
  details: {
    checkIn: Date,
    checkOut: Date,
    passengers: Number,
    location: String
  }
}, { timestamps: true });

// Activity Schema
const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  category: { type: String, enum: ['sightseeing', 'adventure', 'cultural', 'food', 'shopping', 'nightlife'] },
  description: { type: String },
  duration: { type: String }, // e.g., "2 hours", "half day"
  cost: { type: Number },
  rating: { type: Number, min: 1, max: 5 },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  openingHours: { type: String },
  images: [{ type: String }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Destination = mongoose.model('Destination', destinationSchema);
const Itinerary = mongoose.model('Itinerary', itinerarySchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Activity = mongoose.model('Activity', activitySchema);

module.exports = {
  User,
  Destination,
  Itinerary,
  Booking,
  Activity
};