// routes/activities.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// GET all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
