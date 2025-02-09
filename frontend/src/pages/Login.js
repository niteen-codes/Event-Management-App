import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    let errors = {};
    // Validate Username
    if (!username.trim()) {
      errors.username = "Please enter your username.";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters long.";
    }

    // Validate Password
    if (!password) {
      errors.password = "Please enter your password.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    setErrors(errors);
  }, [username, password]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleLogin = async (e) => {
    e.preventDefault();
    validateForm();
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await axios.post("https://event-management-app-ccof.onrender.com/api/auth/login", { username, password });
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } catch (err) {
        console.error("Login failed:", err.response?.data?.error || "An error occurred");
        setErrors({ general: "Invalid username or password. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await axios.post("https://event-management-app-ccof.onrender.com/api/auth/guest-login");
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Guest login failed:", err.response?.data?.error || "An error occurred");
      setErrors({ general: "Guest login failed. Please try again." });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        {errors.general && <p className="error-message">{errors.general}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`login-input ${errors.username ? "input-error" : ""}`}
            />
            {errors.username && <p className="error-message">{errors.username}</p>}
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`login-input ${errors.password ? "input-error" : ""}`}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>
          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <button onClick={handleGuestLogin} className="guest-login-button">
          Login as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
