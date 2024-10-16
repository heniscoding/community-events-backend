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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      email: { 
        type: String, 
        required: true 
      },
    },
  ],
  imageUrl: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  capacity: {
    type: Number,
    required: false,
    min: 0,
  },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
