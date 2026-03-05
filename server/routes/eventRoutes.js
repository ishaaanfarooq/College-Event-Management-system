const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const Event = require("../models/Event");
const User = require("../models/User");
const { sendPushNotification } = require("../utils/firebaseAdmin");

/* =====================================================
   CREATE EVENT
===================================================== */
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created
 *   get:
 *     summary: Get all events (Admin sees all, Students see published + own)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, date, location, maxCapacity, category, registrationDeadline } = req.body;

    const missingFields = [];
    if (!title) missingFields.push("Title");
    if (!description) missingFields.push("Description");
    if (!date) missingFields.push("Date");
    if (!location) missingFields.push("Location");
    if (!maxCapacity) missingFields.push("Max Capacity");
    if (!category) missingFields.push("Category");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
    }

    const today = new Date();

    if (new Date(date) < today) {
      return res.status(400).json({
        message: "Event date cannot be in the past"
      });
    }

    if (registrationDeadline && new Date(registrationDeadline) < today) {
      return res.status(400).json({
        message: "Registration deadline cannot be in the past"
      });
    }

    const eventStatus = req.user.role === "admin" ? "published" : "pending_review";

    const event = await Event.create({
      ...req.body,
      status: eventStatus,
      createdBy: req.user._id
    });

    res.status(201).json(event);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    // Admin sees all events, students see published + their own
    const query = req.user.role === "admin"
      ? {}
      : { $or: [{ status: "published" }, { createdBy: req.user._id }] };

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .populate("applications.user", "name email");

    res.json(events);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   APPLY TO EVENT
===================================================== */
/**
 * @swagger
 * /events/apply/{id}:
 *   post:
 *     summary: Apply to an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               usn: { type: string }
 *     responses:
 *       200:
 *         description: Application submitted
 */
router.post("/apply/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const now = new Date();

    // ❌ Admins cannot apply
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot apply to events"
      });
    }

    // ❌ Creator cannot apply
    if (event.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Event creator cannot apply"
      });
    }

    // ❌ Event date passed
    if (new Date(event.date) < now) {
      return res.status(400).json({
        message: "Event already completed"
      });
    }

    // ❌ Registration deadline passed
    if (event.registrationDeadline &&
      new Date(event.registrationDeadline) < now) {
      return res.status(400).json({
        message: "Registration deadline passed"
      });
    }

    // ❌ Capacity full
    const acceptedCount = event.applications.filter(
      app => app.status === "accepted"
    ).length;

    if (acceptedCount >= event.maxCapacity) {
      return res.status(400).json({
        message: "Event capacity full"
      });
    }

    // ❌ Already applied
    const alreadyApplied = event.applications.some(
      app => app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        message: "Already applied"
      });
    }

    event.applications.push({
      user: req.user._id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      usn: req.body.usn,
      status: "pending"
    });

    await event.save();

    // Notify Event Creator
    const creator = await User.findById(event.createdBy);
    if (creator && creator.fcmToken) {
      await sendPushNotification(
        creator.fcmToken,
        "New Event Application",
        `${req.body.name} has applied for your event "${event.title}"`,
        { eventId: event._id.toString() }
      );
    }

    res.json({ message: "Application submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /events/application/{eventId}/{appId}:
 *   patch:
 *     summary: Creator accepts or rejects an application
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *       - in: path
 *         name: appId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [accepted, rejected] }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Application updated
 */
router.patch("/application/:eventId/:appId", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only the event creator can review applications
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Permission denied. Only the event creator can review applications." });
    }

    const { status, message } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const application = event.applications.id(req.params.appId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // If accepting → check capacity
    if (status === "accepted") {
      const acceptedCount = event.applications.filter(
        app => app.status === "accepted"
      ).length;

      if (acceptedCount >= event.maxCapacity) {
        return res.status(400).json({
          message: "Capacity already full"
        });
      }
    }

    application.status = status;
    application.message = message || "";

    await event.save();

    // Notify Applicant
    const applicant = await User.findById(application.user);
    if (applicant && applicant.fcmToken) {
      await sendPushNotification(
        applicant.fcmToken,
        "Application Status Updated",
        `Your application for "${event.title}" has been ${status}.`,
        { eventId: event._id.toString(), status: status }
      );
    }

    res.json({ message: "Application updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /events/review/{id}:
 *   patch:
 *     summary: Admin reviews pending event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [published, rejected] }
 *     responses:
 *       200:
 *         description: Event status updated
 */
router.patch("/review/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { status } = req.body;

    if (!["published", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = status;
    await event.save();

    // Notify Creator
    const creator = await User.findById(event.createdBy);
    if (creator && creator.fcmToken) {
      await sendPushNotification(
        creator.fcmToken,
        "Event Review Status",
        `Your event "${event.title}" has been ${status} by an admin.`,
        { eventId: event._id.toString(), status: status }
      );
    }

    res.json({ message: `Event ${status} successfully`, event });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   LOG EVENT VIEW (INCREMENT VIEW COUNT)
===================================================== */
/**
 * @swagger
 * /events/{id}/hit:
 *   patch:
 *     summary: Log an event impression (hit)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Hit logged
 */
router.patch("/:id/hit", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "View logged" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /events/{id}/dwell:
 *   patch:
 *     summary: Log dwell time (screen time) for an event
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration: { type: number, description: "Time in ms" }
 *     responses:
 *       200:
 *         description: Dwell time logged
 */
router.patch("/:id/dwell", authMiddleware, async (req, res) => {
  try {
    const { duration } = req.body; // duration in ms
    if (typeof duration !== "number" || duration <= 0) {
      return res.status(400).json({ message: "Invalid duration" });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalViewTime: duration } },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Dwell time logged" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /events/creator/stats:
 *   get:
 *     summary: Get engagement analytics for creator's events
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of event statistics
 */
router.get("/creator/stats", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .select("title viewCount totalViewTime applications category status");

    const stats = events.map(ev => ({
      _id: ev._id,
      title: ev.title,
      category: ev.category,
      status: ev.status,
      views: ev.viewCount,
      dwellTime: ev.totalViewTime,
      applications: ev.applications.length,
      engagementScore: ev.viewCount > 0 ? ((ev.applications.length / ev.viewCount) * 100).toFixed(2) : 0
    }));

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;