import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import EventList from "../components/EventList";
import EventForm from "../components/EventForm";
import "./Dashboard.css";

const Dashboard = () => {
  const [events, setEvents] = useState({ upcomingEvents: [], pastEvents: [] });
  const [filter, setFilter] = useState({ category: "", date: "" });
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  // Redirect to login if user is not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token is found
    } else {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.userId);
      setIsGuest(decodedToken.userId === "guest");
    }
  }, [navigate]);

  // Memoize fetchEvents to avoid unnecessary re-renders
  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get("https://event-management-app-trmh.onrender.com/api/events", {
        params: filter,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvents(response.data);
    } catch (err) {
      console.error("Failed to fetch events:", err.response?.data?.error || "Unknown error");
      alert(`Failed to fetch events: ${err.response?.data?.error || "Unknown error"}`);
    }
  }, [filter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Socket.IO connection
  useEffect(() => {
    const socket = io("https://event-management-app-trmh.onrender.com", {
      transports: ["websocket"], // Force WebSocket transport
    });

    // Listen for new events
    socket.on("newEvent", (newEvent) => {
      setEvents((prevEvents) => {
        const now = new Date();
        const upcomingEvents = [...prevEvents.upcomingEvents];
        const pastEvents = [...prevEvents.pastEvents];

        if (new Date(newEvent.date) > now) {
          upcomingEvents.push(newEvent);
        } else {
          pastEvents.push(newEvent);
        }

        return { upcomingEvents, pastEvents };
      });
    });

    // Listen for event updates
    socket.on("updateEvent", (updatedEvent) => {
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.upcomingEvents.map((event) =>
          event._id === updatedEvent._id ? updatedEvent : event
        );
        return { ...prevEvents, upcomingEvents: updatedEvents };
      });
    });

    // Listen for event cancellations
    socket.on("cancelEvent", (cancelledEvent) => {
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.upcomingEvents.map((event) =>
          event._id === cancelledEvent._id ? cancelledEvent : event
        );
        return { ...prevEvents, upcomingEvents: updatedEvents };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAttendEvent = async (eventId) => {
    try {
      await axios.post(`https://event-management-app-trmh.onrender.com/api/events/${eventId}/attend`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchEvents(); // Refresh events after attending
    } catch (err) {
      console.error("Failed to attend event:", err.response?.data?.error || "Unknown error");
      alert(`Failed to attend event: ${err.response?.data?.error || "Unknown error"}`);
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await axios.post(`https://event-management-app-trmh.onrender.com/api/events/${eventId}/leave`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchEvents(); // Refresh events after leaving
    } catch (err) {
      console.error("Failed to leave event:", err.response?.data?.error || "Unknown error");
      alert(`Failed to leave event: ${err.response?.data?.error || "Unknown error"}`);
    }
  };

  const handleUpdateEvent = (event) => {
    setEditingEvent(event);
  };

  const handleCancelEvent = async (eventId) => {
    try {
      await axios.post(`https://event-management-app-trmh.onrender.com/api/events/${eventId}/cancel`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchEvents(); // Refresh events after cancellation
    } catch (err) {
      console.error("Failed to cancel event:", err.response?.data?.error || "Unknown error");
      alert(`Failed to cancel event: ${err.response?.data?.error || "Unknown error"}`);
    }
  };

  const handleSaveEvent = async (updatedEvent) => {
    try {
      await axios.put(`https://event-management-app-trmh.onrender.com/api/events/${updatedEvent._id}`, updatedEvent, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchEvents(); // Refresh events after updating
      setEditingEvent(null); // Close the edit form
    } catch (err) {
      console.error("Failed to update event:", err.response?.data?.error || "Unknown error");
      alert(`Failed to update event: ${err.response?.data?.error || "Unknown error"}`);
    }
  };

  return (
    <div className="dashboard-container">
      {localStorage.getItem("token") ? (
        <div className="dashboard-content">
          <h1 className="dashboard-title">Event Dashboard</h1>
          <div className="filter-container">
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="filter-input"
            >
              <option value="">All Categories</option>
              <option value="Business & Corporate Events">Business & Corporate Events</option>
              <option value="Social & Personal Events">Social & Personal Events</option>
              <option value="Educational Events">Educational Events</option>
              <option value="Cultural & Religious Events">Cultural & Religious Events</option>
              <option value="Entertainment & Recreational Events">Entertainment & Recreational Events</option>
              <option value="Sports & Fitness Events">Sports & Fitness Events</option>
              <option value="Charity & Fundraising Events">Charity & Fundraising Events</option>
              <option value="Government & Political Events">Government & Political Events</option>
              <option value="Technology & Innovation Events">Technology & Innovation Events</option>
              <option value="Virtual & Hybrid Events">Virtual & Hybrid Events</option>
            </select>
            <input
              type="date"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
              className="filter-input"
            />
            <button onClick={fetchEvents} className="search-button">
              Search
            </button>
          </div>
          <EventForm isGuest={isGuest} />
          {editingEvent && (
            <div className="edit-event-form">
              <h2>Edit Event</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEvent(editingEvent);
                }}
              >
                <input
                  type="text"
                  placeholder="Event Name"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="form-input"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="form-textarea"
                  required
                />
                <input
                  type="datetime-local"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="form-input"
                  required
                />
                <select
                  value={editingEvent.category}
                  onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Business & Corporate Events">Business & Corporate Events</option>
                  <option value="Social & Personal Events">Social & Personal Events</option>
                  <option value="Educational Events">Educational Events</option>
                  <option value="Cultural & Religious Events">Cultural & Religious Events</option>
                  <option value="Entertainment & Recreational Events">Entertainment & Recreational Events</option>
                  <option value="Sports & Fitness Events">Sports & Fitness Events</option>
                  <option value="Charity & Fundraising Events">Charity & Fundraising Events</option>
                  <option value="Government & Political Events">Government & Political Events</option>
                  <option value="Technology & Innovation Events">Technology & Innovation Events</option>
                  <option value="Virtual & Hybrid Events">Virtual & Hybrid Events</option>
                </select>
                <button type="submit" className="submit-button">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditingEvent(null)}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
          <EventList
            events={events.upcomingEvents}
            title="Upcoming Events"
            onAttend={handleAttendEvent}
            onLeave={handleLeaveEvent}
            onUpdate={handleUpdateEvent}
            onCancel={handleCancelEvent}
            isPast={false}
            userId={userId}
            isGuest={isGuest}
          />
          <EventList
            events={events.pastEvents}
            title="Past Events"
            onAttend={handleAttendEvent}
            onLeave={handleLeaveEvent}
            onUpdate={handleUpdateEvent}
            onCancel={handleCancelEvent}
            isPast={true}
            userId={userId}
            isGuest={isGuest}
          />
        </div>
      ) : (
        <p>Please log in to view events.</p>
      )}
    </div>
  );
};

export default Dashboard;