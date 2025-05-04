const mongoose = require("mongoose");

const GoalDataSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: true },
    goals: {
      type: Map,
      of: String, // Store goals with their date as keys and the goal content as values
      required: true,
    },
  },
  {
    collection: "GoalData",
    timestamps: true, // Add timestamps for created and updated fields
  }
);

const GoalData = mongoose.model("GoalData", GoalDataSchema);
module.exports = GoalData; // Ensure this export