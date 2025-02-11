import React, { useState } from "react";
import axios from "axios";
import "./EventForm.css";
import { FaPaperclip } from "react-icons/fa";

const EventForm = ({ isGuest, onEventCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    category: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) {
      errors.name = "Event name is required.";
    } else if (formData.name.length < 3) {
      errors.name = "Event name must be at least 3 characters.";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    if (!formData.date) {
      errors.date = "Date and time are required.";
    } else {
      const selectedDate = new Date(formData.date);
      const currentDate = new Date();
      if (selectedDate <= currentDate) {
        errors.date = "Please select a future date and time.";
      }
    }

    if (!formData.category) {
      errors.category = "Please select a category.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to log in to create an event.");
        setLoading(false);
        return;
      }

      let imageUrl = null;
      if (formData.image) {
        const formDataToUpload = new FormData();
        formDataToUpload.append("file", formData.image);
        formDataToUpload.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formDataToUpload
        );
        imageUrl = cloudinaryResponse.data.secure_url;
      }

      const response = await axios.post(
        "https://event-management-app-3771.onrender.com/api/events",
        {
          ...formData,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFormData({ name: "", description: "", date: "", category: "", image: null });
      setErrors({});
      alert("Event created successfully!");
      if (onEventCreated) {
        onEventCreated(response.data);
      }
    } catch (err) {
      console.error("Failed to create event:", err.response?.data?.error || "Unknown error");
      alert(`Failed to create event: ${err.response?.data?.error || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
    return <p className="guest-message">Guest users cannot create events.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <h2 className="event-form-title">Create Event</h2>
      <div className="form-group">
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? "input-error" : ""}`}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>
      <div className="form-group">
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className={`form-textarea ${errors.description ? "input-error" : ""}`}
        />
        {errors.description && <p className="error-message">{errors.description}</p>}
      </div>
      <div className="form-group">
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`form-input ${errors.date ? "input-error" : ""}`}
          min={new Date().toISOString().slice(0, 16)}
        />
        {errors.date && <p className="error-message">{errors.date}</p>}
      </div>
      <div className="form-group">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`form-input ${errors.category ? "input-error" : ""}`}
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
        {errors.category && <p className="error-message">{errors.category}</p>}
      </div>

      <div className="form-group">
  <label className="file-input-container">
    <FaPaperclip className="clip-icon" />
    <span className="file-label">Attach File</span>
    <input type="file" name="image" onChange={handleFileChange} accept="image/*" className="file-input" />
  </label>
  {formData.image && <p className="file-name">Selected: {formData.image.name}</p>}
</div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
};

export default EventForm;
