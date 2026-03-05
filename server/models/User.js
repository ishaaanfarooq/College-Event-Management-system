const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "student"],
    default: "student"
  },
  canCreateEvent: {
    type: Boolean,
    default: false
  },
  resetOtp: {
    type: String,
    default: null
  },
  resetOtpExpires: {
    type: Date,
    default: null
  },
  fcmToken: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);