const express = require('express');
const { Destination, Activity } = require('../models');
const router = express.Router();

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const { country, budget, search } = req.query;
    let query = {};
    
    if (country) query.country = country;
    if (budget) {
      const budgetRanges = {
        budget: { $lt: 100 },
        'mid-range': { $gte: 100, $lte: 300 },
        luxury: { $gt: 300 }
      };
      query.averageCost = budgetRanges[budget];
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const destinations = await Destination.find(query).sort({ rating: -1 });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destinations', error: error.message });
  }
});

// Get single destination
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    // Get activities for this destination
    const activities = await Activity.find({ destinationId: req.params.id });
    
    res.json({ ...destination.toObject(), activities });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destination', error: error.message });
  }
});

// Create new destination (admin only)
router.post('/', async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    res.status(201).json(destination);
  } catch (error) {
    res.status(400).json({ message: 'Error creating destination', error: error.message });
  }
});

// Update destination
router.put('/:id', async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json(destination);
  } catch (error) {
    res.status(400).json({ message: 'Error updating destination', error: error.message });
  }
});

// Delete destination
router.delete('/:id', async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting destination', error: error.message });
  }
});

// Get popular destinations
router.get('/popular/trending', async (req, res) => {
  try {
    const destinations = await Destination.find()
      .sort({ rating: -1 })
      .limit(10);
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular destinations', error: error.message });
  }
});

// Get destinations by country
router.get('/country/:country', async (req, res) => {
  try {
    const destinations = await Destination.find({ 
      country: { $regex: req.params.country, $options: 'i' } 
    });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destinations by country', error: error.message });
  }
});

module.exports = router;