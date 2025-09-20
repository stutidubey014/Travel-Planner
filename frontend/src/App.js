import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, DollarSign, Users, Plus, X, Edit, Trash2, Star, Clock, Navigation, Bell, Home, User } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('destinations');
  const [user, setUser] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [showCreateItinerary, setShowCreateItinerary] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Mock data
  const mockDestinations = [
    {
      _id: '1',
      name: 'Paris',
      country: 'France',
      description: 'The City of Light, known for its art, culture, and cuisine.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop&auto=format',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      averageCost: 150,
      rating: 4.8,
      activities: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise']
    },
    {
      _id: '2',
      name: 'Tokyo',
      country: 'Japan',
      description: 'A bustling metropolis blending traditional and modern culture.',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop&auto=format',
      coordinates: { lat: 35.6762, lng: 139.6503 },
      averageCost: 200,
      rating: 4.7,
      activities: ['Shibuya Crossing', 'Tokyo Tower', 'Senso-ji Temple']
    }
    // Add more destinations if needed
  ];

  const mockItineraries = [
    {
      _id: '1',
      title: 'European Adventure',
      destinations: [{ _id: '1', name: 'Paris', country: 'France', imageUrl: mockDestinations[0].imageUrl }],
      startDate: '2024-06-15',
      endDate: '2024-06-22',
      budget: 2000,
      status: 'planning',
      days: []
    }
    // Add more itineraries if needed
  ];

  useEffect(() => {
    setDestinations(mockDestinations);
    setItineraries(mockItineraries);
    setUser({ id: '1', name: 'John Doe', email: 'john@example.com' });
    setShowLogin(false);
  }, []);

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDestinationSelection = (destination) => {
    setSelectedDestinations(prev => {
      const isSelected = prev.find(d => d._id === destination._id);
      if (isSelected) {
        return prev.filter(d => d._id !== destination._id);
      } else {
        return [...prev, destination];
      }
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ id: '1', name: 'John Doe', email: loginForm.email });
    setShowLogin(false);
  };

  // Login form
  const LoginForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl inline-block mb-4">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">TravelPlanner</h1>
          <p className="text-gray-600">Plan your perfect journey</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg">Sign In</button>
        </form>
      </div>
    </div>
  );

  // Destination card
  const DestinationCard = ({ destination }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <img src={destination.imageUrl} alt={destination.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg">{destination.name}</h3>
        <p className="text-gray-600 text-sm">{destination.description}</p>
        <div className="flex justify-between mt-2">
          <span className="text-green-600">${destination.averageCost}/day</span>
          <button
            onClick={() => toggleDestinationSelection(destination)}
            className={`px-3 py-1 rounded-lg text-white ${selectedDestinations.find(d => d._id === destination._id) ? 'bg-blue-600' : 'bg-blue-300'}`}
          >
            {selectedDestinations.find(d => d._id === destination._id) ? 'Selected' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );

  if (showLogin) return <LoginForm />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white sticky top-0 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">TravelPlanner</h1>
        <div>{user?.name}</div>
      </header>
      <main className="p-4">
        {currentView === 'destinations' && (
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="w-full mb-4 px-4 py-2 border rounded-lg"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDestinations.map(dest => <DestinationCard key={dest._id} destination={dest} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
