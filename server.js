const express = require("express");
const session = require("express-session");
const path = require("path");
const connectDB = require("./database");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static public files
app.use(express.static(path.join(__dirname, "client")));
app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false
}));

// API Routes
app.use("/api/users", userRoutes);

// Fallback only for paths WITHOUT a file extension
app.get(/^\/(?!models|.*\..*$).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
