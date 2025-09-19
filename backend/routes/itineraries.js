const express = require('express');
const { Itinerary, Destination } = require('../models');
const { authenticateToken } = require('../middleware/auth');  // keep only this one
const router = express.Router();


// Get all itineraries for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user.userId })
      .populate('destinations', 'name country imageUrl')
      .sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itineraries', error: error.message });
  }
});

// Get single itinerary
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('destinations');
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itinerary', error: error.message });
  }
});

// Create new itinerary
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, destinations, startDate, endDate, budget, days, notes } = req.body;
    
    const itinerary = new Itinerary({
      title,
      userId: req.user.userId,
      destinations,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      days: days || [],
      notes
    });

    await itinerary.save();
    await itinerary.populate('destinations', 'name country imageUrl');
    
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(400).json({ message: 'Error creating itinerary', error: error.message });
  }
});

// Update itinerary
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('destinations');

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json(itinerary);
  } catch (error) {
    res.status(400).json({ message: 'Error updating itinerary', error: error.message });
  }
});

// Delete itinerary
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting itinerary', error: error.message });
  }
});

// Add activity to specific day
router.post('/:id/days/:dayIndex/activities', authenticateToken, async (req, res) => {
  try {
    const { id, dayIndex } = req.params;
    const { time, activity, location, cost, notes } = req.body;

    const itinerary = await Itinerary.findOne({ _id: id, userId: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const dayIdx = parseInt(dayIndex);
    if (!itinerary.days[dayIdx]) {
      // Create the day if it doesn't exist
      itinerary.days[dayIdx] = {
        day: dayIdx + 1,
        date: new Date(itinerary.startDate.getTime() + dayIdx * 24 * 60 * 60 * 1000),
        activities: []
      };
    }

    itinerary.days[dayIdx].activities.push({
      time,
      activity,
      location,
      cost: cost || 0,
      notes
    });

    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(400).json({ message: 'Error adding activity', error: error.message });
  }
});

// Update activity in specific day
router.put('/:id/days/:dayIndex/activities/:activityIndex', authenticateToken, async (req, res) => {
  try {
    const { id, dayIndex, activityIndex } = req.params;
    const activityData = req.body;

    const itinerary = await Itinerary.findOne({ _id: id, userId: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const dayIdx = parseInt(dayIndex);
    const actIdx = parseInt(activityIndex);

    if (itinerary.days[dayIdx] && itinerary.days[dayIdx].activities[actIdx]) {
      itinerary.days[dayIdx].activities[actIdx] = {
        ...itinerary.days[dayIdx].activities[actIdx],
        ...activityData
      };
      await itinerary.save();
      res.json(itinerary);
    } else {
      res.status(404).json({ message: 'Activity not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating activity', error: error.message });
  }
});

// Delete activity from specific day
router.delete('/:id/days/:dayIndex/activities/:activityIndex', authenticateToken, async (req, res) => {
  try {
    const { id, dayIndex, activityIndex } = req.params;

    const itinerary = await Itinerary.findOne({ _id: id, userId: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const dayIdx = parseInt(dayIndex);
    const actIdx = parseInt(activityIndex);

    if (itinerary.days[dayIdx] && itinerary.days[dayIdx].activities[actIdx]) {
      itinerary.days[dayIdx].activities.splice(actIdx, 1);
      await itinerary.save();
      res.json(itinerary);
    } else {
      res.status(404).json({ message: 'Activity not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity', error: error.message });
  }
});

// Generate automatic itinerary based on preferences
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { destinationIds, startDate, endDate, budget, preferences } = req.body;
    
    const destinations = await Destination.find({ _id: { $in: destinationIds } });
    const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    
    // Simple itinerary generation logic
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
      const destination = destinations[i % destinations.length];
      
      days.push({
        day: i + 1,
        date: dayDate,
        activities: [
          {
            time: '09:00',
            activity: `Explore ${destination.name}`,
            location: destination.name,
            cost: Math.floor(budget / totalDays * 0.3),
            notes: `Suggested activity based on your preferences`
          },
          {
            time: '14:00',
            activity: `Lunch at local restaurant`,
            location: destination.name,
            cost: Math.floor(budget / totalDays * 0.2),
            notes: `Try local cuisine`
          },
          {
            time: '16:00',
            activity: destination.activities?.[0] || 'Sightseeing',
            location: destination.name,
            cost: Math.floor(budget / totalDays * 0.3),
            notes: `Popular activity in ${destination.name}`
          }
        ]
      });
    }

    const itinerary = {
      title: `Trip to ${destinations.map(d => d.name).join(', ')}`,
      destinations: destinationIds,
      startDate,
      endDate,
      budget,
      days,
      status: 'planning'
    };

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: 'Error generating itinerary', error: error.message });
  }
});

module.exports = router;