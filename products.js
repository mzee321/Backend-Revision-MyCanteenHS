const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productImage: String, // URL of the product image
    productName: String,
    stallId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: String,
    description: String, // Optional: If you want to add a description field
    price: Number, // Changed to Number
    availableStocks: Number, // Changed to Number
    availStatus: { type: String, default: "Available" }, // Default status is 'Available'
    archive: String,
  },
  {
    collection: "productInfo", // Collection name
  }
);

module.exports = mongoose.model("Product", ProductSchema);
