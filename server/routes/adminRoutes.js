const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

/**
 * @swagger
 * /admin/permission/{id}:
 *   patch:
 *     summary: Toggle event creation permission for a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Permission updated
 */
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

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all registered users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
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