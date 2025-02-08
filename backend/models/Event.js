const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user who created the event
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of users attending the event
  status: { type: String, default: "active" }, // Event status: "active" or "cancelled"
});

module.exports = mongoose.model("Event", eventSchema);