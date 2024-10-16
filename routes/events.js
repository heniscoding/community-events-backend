const express = require('express');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const { auth, staffOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, staffOnly, async (req, res) => { 
  const { name, date, location, description, type } = req.body; 
  const createdBy = req.user.id;

  try {
    const newEvent = new Event({ name, date, location, description, type, createdBy });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: 'Error creating event' });
  }
});


router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

router.post('/:id/signup', auth, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const email = req.user.email;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const alreadyRegistered = event.participants.some(participant => participant.userId.toString() === userId);
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'User is already registered for this event' });
    }

    event.participants.push({ userId, email });
    await event.save();

    await Registration.create({ userId, event: eventId });

    res.status(200).json(event);
  } catch (error) {
    console.error('Error signing up for event:', error);
    res.status(400).json({ error: 'Error signing up for event' });
  }
});

router.get('/my-registrations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await Registration.find({ userId })
      .populate('event');

    res.status(200).json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Error fetching registrations.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate('participants.userId');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Error fetching event details' });
  }
});


module.exports = router;
