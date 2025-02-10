const express = require("express");
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  attendEvent,
  leaveEvent,
  cancelEvent, // Add this
} = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new event (protected route)
router.post("/", authMiddleware, createEvent);

// Fetch all events (protected route)
router.get("/", authMiddleware, getEvents);

// Update an event (protected route)
router.put("/:id", authMiddleware, updateEvent);

// Delete an event (protected route)
router.delete("/:id", authMiddleware, deleteEvent);

// Attend an event (protected route)
router.post("/:id/attend", authMiddleware, attendEvent);

// Leave an event (protected route)
router.post("/:id/leave", authMiddleware, leaveEvent);

// Cancel an event (protected route)
router.post("/:id/cancel", authMiddleware, cancelEvent); // Add this route

module.exports = router;