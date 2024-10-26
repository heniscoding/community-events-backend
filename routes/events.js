router.post(
  "/",
  auth,
  staffOnly,
  upload.single("image"),
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("date").isISO8601().withMessage("Valid start date is required"),
    check("endDate").isISO8601().withMessage("Valid end date is required"),
    check("location").notEmpty().withMessage("Location is required"),
    check("capacity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Capacity must be a positive number"),
    check("category")
      .optional()
      .isString()
      .withMessage("Category must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      date,
      endDate,
      location,
      description,
      category,
      capacity,
      type,
    } = req.body;
    const createdBy = req.user.id;

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/${req.file.path.replace(
          /\\/g,
          "/"
        )}`
      : null;

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
      handleError(res, error, "Error creating event");
    }
  }
);
