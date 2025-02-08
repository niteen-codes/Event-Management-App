import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    validateForm(); // Run validation before submitting

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await axios.post("http://localhost:5000/api/auth/login", { username, password });
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } catch (err) {
        console.error("Login failed:", err.response?.data?.error || "An error occurred");
        setErrors({ general: "Invalid username or password!" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/guest-login");
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Guest login failed:", err.response?.data?.error || "An error occurred");
      setErrors({ general: "Guest login failed!" });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        {errors.general && <p className="error-message">{errors.general}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`login-input ${errors.username ? "error" : ""}`}
          />
          {errors.username && <p className="error-message">{errors.username}</p>}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`login-input ${errors.password ? "error" : ""}`}
          />
          {errors.password && <p className="error-message">{errors.password}</p>}

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
