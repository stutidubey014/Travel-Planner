const mongoose = require('mongoose');
const { Destination, Activity, User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_planner');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Destination.deleteMany({});
    await Activity.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Sample destinations
    const destinations = [
      {
        name: 'Paris',
        country: 'France',
        description: 'The City of Light, known for its art, fashion, cuisine, and culture. Home to iconic landmarks like the Eiffel Tower and Louvre Museum.',
        imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        averageCost: 150,
        bestTimeToVisit: 'April to June, September to October',
        activities: ['Museums', 'Fine Dining', 'Architecture', 'Shopping'],
        accommodations: [
          { name: 'Hotel Plaza Athénée', type: 'hotel', priceRange: '$500-800', rating: 5 },
          { name: 'Generator Paris', type: 'hostel', priceRange: '$30-60', rating: 4 }
        ],
        rating: 4.8
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        description: 'A bustling metropolis that seamlessly blends traditional Japanese culture with cutting-edge technology and modernity.',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        coordinates: { lat: 35.6762, lng: 139.6503 },
        averageCost: 200,
        bestTimeToVisit: 'March to May, September to November',
        activities: ['Temples', 'Technology', 'Food Culture', 'Shopping'],
        accommodations: [
          { name: 'Park Hyatt Tokyo', type: 'hotel', priceRange: '$400-700', rating: 5 },
          { name: 'Sakura Hostel', type: 'hostel', priceRange: '$40-80', rating: 4 }
        ],
        rating: 4.7
      },
      {
        name: 'Bali',
        country: 'Indonesia',
        description: 'Tropical paradise known for beautiful beaches, ancient temples, lush rice terraces, and vibrant cultural heritage.',
        imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
        coordinates: { lat: -8.4095, lng: 115.1889 },
        averageCost: 80,
        bestTimeToVisit: 'April to October',
        activities: ['Beaches', 'Temples', 'Rice Terraces', 'Surfing'],
        accommodations: [
          { name: 'Four Seasons Resort Bali', type: 'resort', priceRange: '$300-600', rating: 5 },
          { name: 'Zostel Bali', type: 'hostel', priceRange: '$15-30', rating: 4 }
        ],
        rating: 4.6
      },
      {
        name: 'New York',
        country: 'USA',
        description: 'The city that never sleeps, famous for its skyline, Broadway shows, world-class museums, and diverse neighborhoods.',
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        averageCost: 180,
        bestTimeToVisit: 'April to June, September to November',
        activities: ['Broadway Shows', 'Museums', 'Central Park', 'Shopping'],
        accommodations: [
          { name: 'The Plaza Hotel', type: 'hotel', priceRange: '$400-800', rating: 5 },
          { name: 'HI New York City Hostel', type: 'hostel', priceRange: '$50-100', rating: 4 }
        ],
        rating: 4.5
      },
      {
        name: 'Rome',
        country: 'Italy',
        description: 'The Eternal City, rich in history with ancient ruins, magnificent architecture, and world-renowned cuisine.',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        coordinates: { lat: 41.9028, lng: 12.4964 },
        averageCost: 120,
        bestTimeToVisit: 'April to June, September to October',
        activities: ['Ancient History', 'Art', 'Food', 'Architecture'],
        accommodations: [
          { name: 'Hotel de Russie', type: 'hotel', priceRange: '$300-600', rating: 5 },
          { name: 'The RomeHello', type: 'hostel', priceRange: '$25-50', rating: 4 }
        ],
        rating: 4.7
      },
      {
        name: 'Bangkok',
        country: 'Thailand',
        description: 'Vibrant capital city known for ornate temples, bustling street markets, incredible street food, and lively nightlife.',
        imageUrl: 'https://images.unsplash.com/photo-1563492065-c165a1eb4c2b?w=800',
        coordinates: { lat: 13.7563, lng: 100.5018 },
        averageCost: 60,
        bestTimeToVisit: 'November to March',
        activities: ['Temples', 'Street Food', 'Markets', 'Nightlife'],
        accommodations: [
          { name: 'Mandarin Oriental Bangkok', type: 'hotel', priceRange: '$200-400', rating: 5 },
          { name: 'Mad Monkey Hostel', type: 'hostel', priceRange: '$10-25', rating: 4 }
        ],
        rating: 4.4
      }
    ];

    const createdDestinations = await Destination.insertMany(destinations);
    console.log('Created destinations');

    // Sample activities for each destination
    const activities = [
      // Paris activities
      {
        name: 'Eiffel Tower Visit',
        destinationId: createdDestinations[0]._id,
        category: 'sightseeing',
        description: 'Iconic iron tower offering spectacular views of Paris',
        duration: '2 hours',
        cost: 25,
        rating: 4.8,
        location: {
          address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
          coordinates: { lat: 48.8584, lng: 2.2945 }
        },
        openingHours: '9:30 AM - 11:45 PM'
      },
      {
        name: 'Louvre Museum',
        destinationId: createdDestinations[0]._id,
        category: 'cultural',
        description: 'World\'s largest art museum and historic monument',
        duration: '4 hours',
        cost: 15,
        rating: 4.7,
        location: {
          address: 'Rue de Rivoli, 75001 Paris',
          coordinates: { lat: 48.8606, lng: 2.3376 }
        },
        openingHours: '9:00 AM - 6:00 PM'
      },
      // Tokyo activities
      {
        name: 'Shibuya Crossing Experience',
        destinationId: createdDestinations[1]._id,
        category: 'sightseeing',
        description: 'World\'s busiest pedestrian crossing',
        duration: '1 hour',
        cost: 0,
        rating: 4.6,
        location: {
          address: 'Shibuya City, Tokyo',
          coordinates: { lat: 35.6598, lng: 139.7006 }
        },
        openingHours: '24 hours'
      },
      {
        name: 'Senso-ji Temple',
        destinationId: createdDestinations[1]._id,
        category: 'cultural',
        description: 'Ancient Buddhist temple in Asakusa',
        duration: '2 hours',
        cost: 0,
        rating: 4.5,
        location: {
          address: '2-3-1 Asakusa, Taito City, Tokyo',
          coordinates: { lat: 35.7148, lng: 139.7967 }
        },
        openingHours: '6:00 AM - 5:00 PM'
      },
      // Bali activities
      {
        name: 'Uluwatu Temple Sunset',
        destinationId: createdDestinations[2]._id,
        category: 'cultural',
        description: 'Clifftop temple with stunning sunset views',
        duration: '3 hours',
        cost: 5,
        rating: 4.7,
        location: {
          address: 'Pecatu, South Kuta, Badung Regency, Bali',
          coordinates: { lat: -8.8299, lng: 115.0846 }
        },
        openingHours: '9:00 AM - 7:00 PM'
      }
    ];

    await Activity.insertMany(activities);
    console.log('Created activities');

    // Sample admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@travelplanner.com',
      password: hashedPassword,
      preferences: {
        budget: 'luxury',
        travelStyle: 'cultural'
      }
    });

    await adminUser.save();
    console.log('Created admin user');

    console.log('Seed data created successfully!');
    console.log('Admin login: admin@travelplanner.com / admin123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
     console.log('MongoDB connection closed');
  }
};

// Run seed if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;

