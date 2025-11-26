const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  faceEmbedding: {
    type: [Number], // Must be an array of numbers
    required: true  // This stops signup without face capture
  },
  role: {
    type: String,
    default: "resident"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
