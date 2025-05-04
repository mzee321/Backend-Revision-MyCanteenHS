const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    name: String,
    stallname: String,
    email: { type: String, unique: true },
    password: String,
    userType: String,
    profilePicture: String,
    cellNumber: Number,
    college: String, // <-- new
    member: String, // <-- new
    age: Number,    // <-- new
    yearLevel: String,    // <-- new
    authentication: { type: String, default: "Not Authenticated" }, // New field
    secretNumber: { type: String }, // New field for OTP
  },
  {
    collection: "UserInfo",
  } 
);

mongoose.model("UserInfo", UserDetailsSchema);
