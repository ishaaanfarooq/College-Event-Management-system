const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const Event = require("../models/Event");


// ================= CREATE EVENT =================
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && !req.user.canCreateEvent) {
      return res.status(403).json({ message: "Permission denied" });
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


// ================= GET EVENTS =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name")
      .populate("applications.user", "name email");

    res.json(events);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= DELETE EVENT (ADMIN ONLY) =================
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


// ================= APPLY TO EVENT =================
router.post("/apply/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const alreadyApplied = event.applications.some(
      app => app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    event.applications.push({
      user: req.user._id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      usn: req.body.usn,
      status: "pending",
      message: ""
    });

    await event.save();

    res.json({ message: "Application submitted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ACCEPT / REJECT =================
router.patch("/application/:eventId/:appId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { status, message } = req.body;

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const application = event.applications.id(req.params.appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    application.message = message || "";

    const acceptedCount = event.applications.filter(
      app => app.status === "accepted"
    ).length;

    if (acceptedCount >= event.maxCapacity) {
      event.registrationDeadline = new Date();
    }

    await event.save();

    res.json({ message: "Updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;