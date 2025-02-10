import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    let errors = {};
    // Validate Username
    if (!username.trim()) {
      errors.username = "Please enter a username.";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters long.";
    }
    // Validate Password
    if (!password) {
      errors.password = "Please enter a password.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
    // Set the errors object to be shown in the UI
    setErrors(errors);
  }, [username, password]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleRegister = async (e) => {
    e.preventDefault();
    validateForm();
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        await axios.post("https://event-management-app-3771.onrender.com/api/auth/register", { username, password });
        alert("Registration successful! Please log in.");
        navigate("/login");
      } catch (err) {
        console.error("Registration failed:", err.response?.data?.error || "An error occurred");
        setErrors({ general: "This username is already taken. Please choose a different one." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">Create an Account</h1>
        {errors.general && <p className="error-message">{errors.general}</p>}
        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`register-input ${errors.username ? "input-error" : ""}`}
            />
            {errors.username && <p className="error-message">{errors.username}</p>}
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`register-input ${errors.password ? "input-error" : ""}`}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>
          <button type="submit" className="register-button" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
