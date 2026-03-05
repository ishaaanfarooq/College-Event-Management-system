const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authMiddleware");

// Nodemailer Config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Password strict validation Regex (Min 8, 1 uppercase, 1 lower, 1 number, 1 special char)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, description: "Min 8 chars, 1 upper, 1 special, 1 number" }
 *               role: { type: string, enum: [admin, student] }
 *     responses:
 *       200:
 *         description: User created
 *       400:
 *         description: Validation error
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields (name, email, password)" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ THIS MUST BE OUTSIDE LOGIN
router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

/* =====================================================
   FORGOT PASSWORD FLOW
===================================================== */

// 1. Generate & Send OTP
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save OTP to user (expires in 15 mins)
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "College Event Management - Password Reset OTP",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset. Your OTP is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; background: #f3f4f6; padding: 10px 20px; letter-spacing: 5px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp) {
      return res.status(400).json({ message: "Invalid request or OTP expired" });
    }

    if (Date.now() > user.resetOtpExpires) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password reset success
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Double check OTP just in case
    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /auth/fcm-token:
 *   post:
 *     summary: Update user's FCM token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Token updated
 */
router.post("/fcm-token", authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken: token });
    res.json({ message: "FCM token updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;