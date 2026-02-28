const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const Event = require("../models/Event");

/* =====================================================
   CREATE EVENT
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && !req.user.canCreateEvent) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { date, registrationDeadline } = req.body;

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

    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json(event);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   GET ALL EVENTS
===================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .populate("applications.user", "name email");

    res.json(events);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   DELETE EVENT (ADMIN ONLY)
===================================================== */
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
router.post("/apply/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const now = new Date();

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

    res.json({ message: "Application submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   ACCEPT / REJECT APPLICATION
===================================================== */
router.patch("/application/:eventId/:appId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { status, message } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
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

    res.json({ message: "Application updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;