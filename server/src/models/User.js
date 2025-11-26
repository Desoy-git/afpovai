const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, default: null },
  password: { type: String, required: true },
  role: { type: String, enum: ["resident", "admin"], default: "resident" },

  // Face recognition embedding (optional)
  faceEmbedding: { type: [Number], default: null }
});

module.exports = mongoose.model("User", UserSchema);
