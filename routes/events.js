const express = require('express');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const { auth, staffOnly } = require('../middleware/authMiddleware');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const handleError = (res, error, message = 'An error occurred') => {
  console.error(message, error);
  return res.status(500).json({ error: message });
};

router.post(
  '/',
  auth,
  staffOnly,
  upload.single('image'),
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('date').isISO8601().withMessage('Valid start date is required'),
    check('endDate').isISO8601().withMessage('Valid end date is required'),
    check('location').notEmpty().withMessage('Location is required'),
    check('capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a positive number'),
    check('category').optional().isString().withMessage('Category must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, date, endDate, location, description, category, capacity, type } = req.body;
    const createdBy = req.user.id;

    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}` : null;

    try {
      const newEvent = new Event({
        name,
        date,
        endDate,
        location,
        description,
        imageUrl,
        category,
        capacity: capacity || null,
        type,
        createdBy,
      });

      await newEvent.save();
      res.status(201).json(newEvent);
    } catch (error) {
      handleError(res, error, 'Error creating event');
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }).exec();
    
    res.status(200).json({
      events,
    });
  } catch (error) {
    handleError(res, error, 'Error fetching events');
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

    if (event.capacity !== null && event.participants.length >= event.capacity) {
      return res.status(400).json({ error: 'Sorry, this event has reached capacity.' });
    }

    const alreadyRegistered = event.participants.some(
      (participant) => participant.userId.toString() === userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'User is already registered for this event' });
    }

    event.participants.push({ userId, email });
    await event.save();

    await Registration.create({ userId, event: eventId });

    res.status(200).json({ message: 'Successfully registered for the event.', event });
  } catch (error) {
    handleError(res, error, 'Error signing up for event');
  }
});


router.delete('/:id/signup', auth, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.participants = event.participants.filter(
      (participant) => participant.userId.toString() !== userId
    );
    await event.save();

    await Registration.deleteOne({ userId, event: eventId });

    res.status(200).json({ message: 'Successfully unregistered from the event' });
  } catch (error) {
    handleError(res, error, 'Error unregistering from event');
  }
});

router.get('/my-registrations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await Registration.find({ userId })
      .populate('event');

    res.status(200).json(registrations);
  } catch (error) {
    handleError(res, error, 'Error fetching registrations.');
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
    handleError(res, error, 'Error fetching event details');
  }
});

module.exports = router;
