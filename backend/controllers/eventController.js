const Event = require("../models/Event");





// Create a new event
const createEvent = async (req, res) => {
  const { name, description, date, category } = req.body;

  // Validate date
  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  // Ensure the date is in the future
  const now = new Date();
  if (selectedDate <= now) {
    return res.status(400).json({ error: "Please select a future date and time." });
  }

  try {
    const event = new Event({
      name,
      description,
      date: selectedDate.toISOString(), // Store date in UTC
      category,
      createdBy: req.userId, // Attach the user ID from the auth middleware
    });

    await event.save();

    // Emit a new event notification via Socket.IO
    const io = req.app.get("io");
    io.emit("newEvent", event);

    res.status(201).json(event);
  } catch (err) {
    console.error("Failed to create event:", err);
    res.status(500).json({ error: "An error occurred while creating the event." });
  }
};

// Fetch all events and categorize them into upcoming and past
const getEvents = async (req, res) => {
  try {
    const { category, date } = req.query; // Extract query parameters
    const filter = {};

    // Add category filter if provided
    if (category) {
      filter.category = category;
    }

    // Add date filter if provided
    if (date) {
      filter.date = { $gte: new Date(date) }; // Fetch events on or after the specified date
    }

    // Fetch events based on the filter
    const allEvents = await Event.find(filter).populate("createdBy", "username");

    // Categorize events into upcoming and past
    const now = new Date();
    const upcomingEvents = allEvents.filter((event) => new Date(event.date) > now);
    const pastEvents = allEvents.filter((event) => new Date(event.date) <= now);

    // Return the categorized events
    res.json({ upcomingEvents, pastEvents });
  } catch (err) {
    console.error("Failed to fetch events:", err);
    res.status(500).json({ error: "An error occurred while fetching events." });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, category } = req.body;

  // Validate date
  if (date) {
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Ensure only the event creator can update the event
    if (event.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "You are not authorized to update this event." });
    }

    // Update event details
    event.name = name || event.name;
    event.description = description || event.description;
    event.date = date ? new Date(date).toISOString() : event.date; // Store date in UTC
    event.category = category || event.category;

    await event.save();

    // Emit an event update notification via Socket.IO
    const io = req.app.get("io");
    io.emit("updateEvent", event);

    res.json(event);
  } catch (err) {
    console.error("Failed to update event:", err);
    res.status(500).json({ error: "An error occurred while updating the event." });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Ensure only the event creator can delete the event
    if (event.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "You are not authorized to delete this event." });
    }

    await event.remove();

    // Emit an event deletion notification via Socket.IO
    const io = req.app.get("io");
    io.emit("deleteEvent", event);

    res.json({ message: "Event deleted successfully." });
  } catch (err) {
    console.error("Failed to delete event:", err);
    res.status(500).json({ error: "An error occurred while deleting the event." });
  }
};

// Cancel an event
const cancelEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Ensure only the event creator can cancel the event
    if (event.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "You are not authorized to cancel this event." });
    }

    // Mark the event as cancelled
    event.status = "cancelled";
    await event.save();

    // Emit an event cancellation notification via Socket.IO
    const io = req.app.get("io");
    io.emit("cancelEvent", event);

    res.json(event);
  } catch (err) {
    console.error("Failed to cancel event:", err);
    res.status(500).json({ error: "An error occurred while cancelling the event." });
  }
};




// Attend an event
const attendEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Add the user to the attendees list if not already attending
    if (!event.attendees.includes(req.userId)) {
      event.attendees.push(req.userId);
      await event.save();
    }

    res.json(event);
  } catch (err) {
    console.error("Failed to attend event:", err);
    res.status(500).json({ error: "An error occurred while attending the event." });
  }
};






// Leave an event
const leaveEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Remove the user from the attendees list
    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== req.userId
    );

    await event.save();
    res.json(event);
  } catch (err) {
    console.error("Failed to leave event:", err);
    res.status(500).json({ error: "An error occurred while leaving the event." });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  cancelEvent,
  attendEvent,
  leaveEvent,
};