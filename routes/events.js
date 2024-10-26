const express = require('express');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const { auth, staffOnly } = require('../middleware/authMiddleware');
const path = require('path');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

// Initialize multer
const upload = multer({ storage });

// Serve static files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
const handleError = (res, error, message = 'An error occurred') => {
  console.error(message, error);
  return res.status(500).json({ error: message });
};

// POST /events/ - Create a new event
router.post(
  '/',
  auth,
  staffOnly,
  upload.single('image'), // Use multer to handle the file upload
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('date').isISO8601().withMessage('Valid start date is required'),
    check('endDate').isISO8601().withMessage('Valid end date is required'), // Validate end date
    check('location').notEmpty().withMessage('Location is required'), // Validate location
    check('capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a positive number'), // Make capacity optional
    check('category').optional().isString().withMessage('Category must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, date, endDate, location, description, category, capacity, type } = req.body;
    const createdBy = req.user.id;

    // Ensure the image URL is processed correctly
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}` : null;

    try {
      const newEvent = new Event({
        name,
        date,
        endDate,
        location, // Save location to the event
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

// GET /events/ - Get all events with optional pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const events = await Event.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();
    const totalEvents = await Event.countDocuments();

    res.status(200).json({
      events,
      totalPages: Math.ceil(totalEvents / limit),
      currentPage: page,
    });
  } catch (error) {
    handleError(res, error, 'Error fetching events');
  }
});

// POST /events/:id/signup - Sign up for an event with capacity check
// POST /events/:id/signup - Sign up for an event with capacity check
router.post('/:id/signup', auth, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const email = req.user.email;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the event is full, considering that capacity can be null
    if (event.capacity !== null && event.participants.length >= event.capacity) {
      return res.status(400).json({ error: 'Sorry, this event has reached capacity.' });
    }

    // Check if the user is already registered
    const alreadyRegistered = event.participants.some(
      (participant) => participant.userId.toString() === userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'User is already registered for this event' });
    }

    // Add the user to participants
    event.participants.push({ userId, email });
    await event.save();

    // Create a registration record
    await Registration.create({ userId, event: eventId });

    res.status(200).json({ message: 'Successfully registered for the event.', event });
  } catch (error) {
    handleError(res, error, 'Error signing up for event');
  }
});


// DELETE /events/:id/signup - Unregister from an event
router.delete('/:id/signup', auth, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Remove the user from the event's participants list
    event.participants = event.participants.filter(
      (participant) => participant.userId.toString() !== userId
    );
    await event.save();

    // Remove the registration from the Registration model
    await Registration.deleteOne({ userId, event: eventId });

    res.status(200).json({ message: 'Successfully unregistered from the event' });
  } catch (error) {
    handleError(res, error, 'Error unregistering from event');
  }
});

// GET /events/my-registrations - Get all registrations for the authenticated user
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

// GET /events/:id - Get details of a specific event
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