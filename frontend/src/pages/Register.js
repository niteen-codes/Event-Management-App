import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    validateForm(); // Call validation whenever inputs change
  }, [username, password]);

  // 🔍 Validate Form Fields
  const validateForm = () => {
    let errors = {};
    if (!username.trim()) errors.username = "Username is required!";
    if (!password) errors.password = "Password is required!";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters!";
    setErrors(errors);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    validateForm(); // Run validation before submitting

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        await axios.post("https://event-management-app-trmh.onrender.com/api/auth/register", { username, password });
        alert("User registered successfully!");
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
        <h1 className="register-title">Register</h1>
        {errors.general && <p className="error-message">{errors.general}</p>}
        <form onSubmit={handleRegister} className="register-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`register-input ${errors.username ? "input-error" : ""}`}
          />
          {errors.username && <p className="error-message">{errors.username}</p>}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`register-input ${errors.password ? "input-error" : ""}`}
          />
          {errors.password && <p className="error-message">{errors.password}</p>}

          <button type="submit" className="register-button" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
