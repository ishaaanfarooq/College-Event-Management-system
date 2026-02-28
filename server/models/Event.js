const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  usn: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },

  message: {
    type: String,
    default: ""
  },

  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  date: {
    type: Date,
    required: true
  },

  location: { type: String, required: true },

  category: {
    type: String,
    enum: ["Placement", "Department", "Volunteer", "Hackathon", "Workshop", "Other"],
    required: true
  },

  image: String,

  maxCapacity: {
    type: Number,
    default: 50
  },

  registrationDeadline: {
    type: Date,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  applications: [applicationSchema]

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);