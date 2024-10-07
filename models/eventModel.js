const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
  },
  description: {
    type: String,
  },
  createdBy: {
    type: String,
    required: true,
  },
  participants: [
    {
      userId: { type: String, required: true },
      email: { type: String, required: true },
    },
  ],
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
