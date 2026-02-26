const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: String,
  email: String,
  phone: String,
  usn: String,

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
  title: String,
  description: String,
  date: Date,
  location: String,
  category: String,
  image: String,

  maxCapacity: {
    type: Number,
    default: 50
  },

  registrationDeadline: Date,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  applications: [applicationSchema]

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);