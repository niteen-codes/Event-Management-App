const express = require("express");
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  cancelEvent,
  attendEvent,
  leaveEvent,
} = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new event (protected route)
router.post("/", authMiddleware, createEvent);

// Fetch all events with filters for category and date
router.get("/", getEvents);

// Update an event (protected route)
router.put("/:id", authMiddleware, updateEvent);

// Delete an event (protected route)
router.delete("/:id", authMiddleware, deleteEvent);

// Cancel an event (protected route)
router.post("/:id/cancel", authMiddleware, cancelEvent);

// Attend an event (protected route)
router.post("/:eventId/attend", authMiddleware, attendEvent);

// Leave an event (protected route)
router.post("/:eventId/leave", authMiddleware, leaveEvent);

module.exports = router;