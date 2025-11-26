const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// Euclidean Distance Function for Face Comparison
function compareEmbeddings(known, input) {
  if (!known || !input || known.length !== input.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < known.length; i++) {
    sum += Math.pow(known[i] - input[i], 2);
  }
  return Math.sqrt(sum);
}

// 📌 SIGNUP — with face embedding save
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, mobile, password, faceEmbedding } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!faceEmbedding) {
      return res.status(400).json({ message: "Face not detected" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      mobile,
      password: hashed,
      faceEmbedding,
      role: "resident"
    });

    await newUser.save();
    res.json({ success: true, message: "Signup successful!" });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 📌 PASSWORD LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    res.json({ success: true, message: "Login successful!" });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// FACE LOGIN
router.post("/face-login", async (req, res) => {
  try {
    const { faceEmbedding } = req.body;
    if (!faceEmbedding) {
      return res.status(400).json({ message: "Face data missing" });
    }

    const users = await User.find({ faceEmbedding: { $exists: true } });

    let bestMatch = { user: null, distance: Infinity };

    for (const user of users) {
      const storedEmbedding = user.faceEmbedding;
      const distance = Math.sqrt(
        storedEmbedding.reduce((sum, v, i) =>
          sum + Math.pow(v - faceEmbedding[i], 2), 0)
      );

      if (distance < bestMatch.distance) {
        bestMatch = { user, distance };
      }
    }

    if (bestMatch.distance < 0.45) { // recognition threshold
      return res.json({ success: true, message: "Face login successful!" });
    }

    res.status(401).json({ message: "Face not recognized" });

  } catch (err) {
    console.error("Face login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
