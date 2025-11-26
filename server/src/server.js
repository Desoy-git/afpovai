const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const connectDB = require("./database");
const User = require("./models/User");

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../../client")));

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false,
}));

// Face similarity check function
function similarity(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, mobile, password, confirmPassword, embedding } = req.body;

    if (!fullName || !email || !password || !confirmPassword)
      return res.status(400).send("Missing required fields.");

    if (password !== confirmPassword)
      return res.status(400).send("Passwords do not match.");

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send("Email already exists.");

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      mobile: mobile || null,
      password: hashed,
      role: "resident",
      faceEmbedding: embedding || null
    });

    await newUser.save();
    res.send("Signup successful!");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password, embedding } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send("Wrong password");

  if (user.faceEmbedding && embedding) {
    const dist = similarity(embedding, user.faceEmbedding);
    if (dist >= 0.6) return res.status(400).send("Face mismatch");
  }

  req.session.user = { email: user.email, role: user.role };
  res.send("Login successful");
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

app.listen(3000, () => console.log("🔥 Server running on port 3000"));
