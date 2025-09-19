const express = require('express');
const { Booking, Itinerary } = require('../models');
const { authenticateToken } = require('../middleware/auth');   // 
const router = express.Router();

// Get all bookings for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('itineraryId', 'title startDate endDate')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get single booking
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('itineraryId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { itineraryId, type, title, description, bookingDate, cost, provider, details } = req.body;
    
    // Verify itinerary belongs to user
    const itinerary = await Itinerary.findOne({
      _id: itineraryId,
      userId: req.user.userId
    });
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    const booking = new Booking({
      userId: req.user.userId,
      itineraryId,
      type,
      title,
      description,
      bookingDate: new Date(bookingDate),
      cost,
      provider,
      details: details || {},
      bookingReference: generateBookingReference(),
      status: 'pending'
    });

    await booking.save();
    await booking.populate('itineraryId', 'title startDate endDate');
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error creating booking', error: error.message });
  }
});

// Update booking
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('itineraryId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error updating booking', error: error.message });
  }
});

// Delete booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status: 'cancelled' },
      { new: true }
    ).populate('itineraryId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// Confirm booking
router.patch('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status: 'confirmed' },
      { new: true }
    ).populate('itineraryId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error confirming booking', error: error.message });
  }
});

// Get bookings by itinerary
router.get('/itinerary/:itineraryId', authenticateToken, async (req, res) => {
  try {
    // Verify itinerary belongs to user
    const itinerary = await Itinerary.findOne({
      _id: req.params.itineraryId,
      userId: req.user.userId
    });
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const bookings = await Booking.find({
      itineraryId: req.params.itineraryId,
      userId: req.user.userId
    }).sort({ bookingDate: 1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get booking statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId });
    
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalCost: bookings.reduce((sum, b) => sum + b.cost, 0),
      byType: {
        flight: bookings.filter(b => b.type === 'flight').length,
        hotel: bookings.filter(b => b.type === 'hotel').length,
        activity: bookings.filter(b => b.type === 'activity').length,
        transport: bookings.filter(b => b.type === 'transport').length
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking stats', error: error.message });
  }
});

// Generate booking reference
function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRP';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router ;