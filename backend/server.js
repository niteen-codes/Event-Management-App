require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const socketIo = require("socket.io"); // Import Socket.IO

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://event-management-app-gamma.vercel.app", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    credentials: true, // Allow cookies and authentication headers
  })
);
app.use(express.json()); // Parse JSON request bodies

// Logging middleware (optional but recommended for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Health check endpoint (optional but recommended)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "https://event-management-app-gamma.vercel.app", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    credentials: true, // Allow cookies and authentication headers
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Handle custom events here
  socket.on("joinEvent", (eventId) => {
    console.log(`Client ${socket.id} joined event ${eventId}`);
    socket.join(eventId); // Join a room for the event
  });

  socket.on("leaveEvent", (eventId) => {
    console.log(`Client ${socket.id} left event ${eventId}`);
    socket.leave(eventId); // Leave the room for the event
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Attach Socket.IO to the app
app.set("io", io);

// Error handling middleware (must be defined after all routes)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));