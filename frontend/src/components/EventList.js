import React from "react";
import "./EventList.css";

const EventList = ({ events, title, onAttend, onLeave, onUpdate, onCancel, isPast, userId, isGuest }) => {
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="event-list">
      <h2>{title}</h2>
      <table className="event-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Description</th>
            <th>Date</th>
            <th>Category</th>
            <th>Created By</th>
            <th>Attendees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeEvents.map((event) => {
            const isEventPast = new Date(event.date) <= new Date();
            return (
              <tr key={event._id}>
                <td>
                  {event.status === "cancelled" ? (
                    <span className="cancelled-message">Event Cancelled</span>
                  ) : (
                    "Active"
                  )}
                </td>
                <td>{event.name}</td>
                <td>{event.description}</td>
                <td>{new Date(event.date).toLocaleString()}</td>
                <td>{event.category}</td>
                <td>{event.createdBy?.username || "Unknown"}</td>
                <td>{event.attendees?.length || 0}</td>
                <td>
                  {!isGuest && event.createdBy === userId && (
                    <>
                      <button onClick={() => onUpdate(event)}>Edit</button>
                      <button onClick={() => onCancel(event._id)}>Cancel</button>
                    </>
                  )}
                  {!isGuest &&
                    event.createdBy !== userId &&
                    event.status !== "cancelled" &&
                    !isEventPast && (
                      <>
                        <button onClick={() => onAttend(event._id)}>Attend</button>
                        <button onClick={() => onLeave(event._id)}>Leave</button>
                        <button onClick={() => onCancel(event._id)}>Cancel</button>
                      </>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EventList;