const express = require('express');
const router = express.Router();
const Event = require('../models/eventModel');

// Route to create a new event
router.post('/events', async (req, res) => {
  const { name, date, location, description, createdBy } = req.body;

  try {
    const newEvent = new Event({ name, date, location, description, createdBy });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: 'Error creating event' });
  }
});

// Route to get all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

module.exports = router;
