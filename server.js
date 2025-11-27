const express = require("express");
const session = require("express-session");
const path = require("path");
const connectDB = require("./server/src/database");
const userRoutes = require("./server/src/routes/userRoutes");

const app = express();

// Connect database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the client folder
app.use(express.static(path.join(__dirname, "client")));

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false
}));

// API routes
app.use("/api/users", userRoutes);

// Frontend fallback
app.get(/^\/(?!models|.*\..*$).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
