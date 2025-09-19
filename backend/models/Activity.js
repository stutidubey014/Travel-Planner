// backend/models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  location: String,
  price: Number,
  duration: String
});

// Prevent OverwriteModelError
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

module.exports = Activity;
