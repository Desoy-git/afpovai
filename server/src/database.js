const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Loaded MONGO_URI:", uri); // Debug line ✔

    await mongoose.connect(uri);
    console.log("📦 MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ Database Error:", err.message);
  }
};

module.exports = connectDB;
