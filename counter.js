const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Counter identifier
  seq: { type: Number, default: 1 }, // Sequence number
});

module.exports = mongoose.model("Counter", counterSchema);
