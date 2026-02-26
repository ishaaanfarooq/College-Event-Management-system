const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Toggle permission
router.patch("/permission/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from removing own admin privileges accidentally
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot modify admin account" });
    }

    user.canCreateEvent = !user.canCreateEvent;
    await user.save();

    res.json({
      message: "Permission updated successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const users = await User.find().select("-password"); // Hide passwords

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;