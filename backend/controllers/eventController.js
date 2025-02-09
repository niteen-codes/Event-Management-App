const Event = require("../models/Event");
const cloudinary = require("cloudinary").v2;

// Create a new event with image upload
const createEvent = async (req, res) => {
  const { name, description, date, category } = req.body;
  const file = req.files?.image; // Assuming you're using a file upload middleware like multer

  // Validate input
  if (!name || !description || !date || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }

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
    let imageUrl = null;
    if (file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(file.tempFilePath);
      imageUrl = result.secure_url;
    }

    const event = new Event({
      name,
      description,
      date: selectedDate.toISOString(),
      category,
      createdBy: req.userId,
      imageUrl, // Save the image URL
    });

    await event.save();

    // Emit a new event notification via Socket.IO
    const io = req.app.get("io"); // Access the io object
    io.emit("newEvent", event); // Emit the event to all connected clients

    res.status(201).json(event);
  } catch (err) {
    console.error("Failed to create event:", err);
    res.status(500).json({ error: "An error occurred while creating the event." });
  }
};

// Fetch all events (protected route)
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

// Update an event (protected route)
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
    const io = req.app.get("io"); // Access the io object
    io.emit("updateEvent", event); // Emit the event to all connected clients

    res.json(event);
  } catch (err) {
    console.error("Failed to update event:", err);
    res.status(500).json({ error: "An error occurred while updating the event." });
  }
};

// Delete an event (protected route)
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
    const io = req.app.get("io"); // Access the io object
    io.emit("deleteEvent", event); // Emit the event to all connected clients

    res.json({ message: "Event deleted successfully." });
  } catch (err) {
    console.error("Failed to delete event:", err);
    res.status(500).json({ error: "An error occurred while deleting the event." });
  }
};

// Attend an event (protected route)
const attendEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Check if the user is already attending
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ error: "You are already attending this event." });
    }

    // Add the user to the attendees list
    event.attendees.push(userId);
    await event.save();

    res.json({ message: "You have successfully attended the event.", event });
  } catch (err) {
    console.error("Failed to attend event:", err);
    res.status(500).json({ error: "An error occurred while attending the event." });
  }
};

// Leave an event (protected route)
const leaveEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Check if the user is attending the event
    if (!event.attendees.includes(userId)) {
      return res.status(400).json({ error: "You are not attending this event." });
    }

    // Remove the user from the attendees list
    event.attendees = event.attendees.filter((attendee) => attendee.toString() !== userId);
    await event.save();

    res.json({ message: "You have successfully left the event.", event });
  } catch (err) {
    console.error("Failed to leave event:", err);
    res.status(500).json({ error: "An error occurred while leaving the event." });
  }
};

// Cancel an event (protected route)
const cancelEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Ensure only the event creator can cancel the event
    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "You are not authorized to cancel this event." });
    }

    // Update the event status to "cancelled"
    event.status = "cancelled";
    await event.save();

    // Emit an event cancellation notification via Socket.IO
    const io = req.app.get("io"); // Access the io object
    io.emit("cancelEvent", event); // Emit the event to all connected clients

    res.json({ message: "Event cancelled successfully.", event });
  } catch (err) {
    console.error("Failed to cancel event:", err);
    res.status(500).json({ error: "An error occurred while canceling the event." });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  attendEvent,
  leaveEvent,
  cancelEvent, // Add this
};