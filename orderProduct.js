const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  stallId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Stall reference
  stallname: { type: String, required: true }, // <-- ✅ Add this line
  ticketNumber: { type: Number, required: true }, // Incrementing ticket number
  orderBy: { type: String, required: true }, // New field for orderBy
  orderById: { type: String, required: true }, // New field for orderById
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      notes: { type: String }, // <-- ✅ Add this line!
    },
  ],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }, // Timestamp for the order
  status: { type: String, required: true },
},
  {
    collection: "orderInfo", // Collection name
  }
);

module.exports = mongoose.model("Order", orderSchema);