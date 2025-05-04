const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({extended: false}));
const sanitizeHtml = require('sanitize-html');
const corsOptions = {
  origin: '*', // Allow any origin
};
app.use(cors(corsOptions));
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
const jwt = require("jsonwebtoken");  
var nodemailer = require("nodemailer");
const twilio = require("twilio");
const { jwtDecode } = require("jwt-decode");

app.use('/uploadProduct', express.static('uploadProduct'));
app.use('/uploads', express.static('uploads'));
require("dotenv").config();
//Added Code


const axios = require('axios');




const Product = require("./products"); // Import the product model
const Order = require("./orderProduct"); // Import the order model
const Counter = require("./counter"); // Import the counter model
const GoalData = require ("./goaldata");
require("./userDetails");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

  const PORT = process.env.PORT || 5000;

  mongoose.set('strictQuery', false);
  const connectDB = async ()=> {
    try{
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error){
      console.log(error);
      process.exit(1);
    }
  }
  
  
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`)
    })
  });





//Added Code
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
//Added Code

const User = mongoose.model("UserInfo");
const multer = require("multer");
const path = require('path');





// Define storage configuration for multer (For Stall Profile Picture location)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
}); 


var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
      callback(null, true);
    } else {
      console.log("Only JPG and PNG files are supported!");
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // Limit file size to 2MB
  },
});

//--------------------------------------------------------------

// Define new storage configuration for (product picture location when upload)
const newStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploadProduct/"); // New folder for news files
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

// Create new multer instance for products picture ocation
const productPicture = multer({
  storage: newStorage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
      callback(null, true);
    } else {
      console.log("Only JPG and PNG files are supported!");
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // Limit file size to 2MB
  },
});


app.post("/register", upload.single("profilePicture"), async (req, res) => {
  const { name, email, password, userType, stallname, cellNumber, college, member, age, yearLevel } = req.body;
  const profilePicturePath = req.file ? req.file.path : null;

  try {
    
       // Remove any unverified users with the same email before proceeding
       await User.deleteOne({ email, authentication: "Not Authenticated" });

       
    if (await User.findOne({ email })) return res.status(400).json({ status: "email_exists" });
    if (await User.findOne({ name })) return res.status(400).json({ status: "name_exists" });

    const encryptedPassword = await bcrypt.hash(password, 10);
    const secretNumber = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code

    const newUser = await User.create({
      name,
      email,
      password: encryptedPassword,
      userType,
      stallname,
      profilePicture: profilePicturePath,
      cellNumber,
      college,
      member,
      age,
      yearLevel,
      authentication: "Not Authenticated",
      secretNumber,
    });

    // Send OTP via Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "my.canteenofficial@gmail.com", // Replace with your Gmail
        pass: "ulxo bpmf lbjj jopg", // Replace with your app password
      },
    });

    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="background-color: #a41d21; padding: 20px; text-align: center; color: white; font-family: Arial, sans-serif; border-radius: 10px;">
          <h2 style="margin-bottom: 10px;">Your Verification Code</h2>
          <p style="font-size: 18px; margin-bottom: 20px;">Please use the code below to verify your account:</p>
          <div style="background-color: white; color: #a41d21; display: inline-block; padding: 10px 20px; font-size: 30pt; font-weight: bold; border-radius: 5px;">
            ${secretNumber}
          </div>
          <p style="margin-top: 20px; font-size: 14px;">This code will expire in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ status: "pending_verification" });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ status: "error", message: "Registration failed" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ status: "error", message: "User not found" });
    if (user.secretNumber !== otp) return res.status(400).json({ status: "error", message: "Invalid OTP" });

    await User.updateOne({ email }, { authentication: "Authenticated", secretNumber: null });

    res.json({ status: "authenticated" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});



//Revised Code
app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.json({ error: "User is not authenticated. Please register first before you login!" });
  if (user.authentication !== "Authenticated") return res.json({ error: "User not authenticated" });

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { email: user.email, userType: user.userType, stallname: user.stallname, id: user._id, profilePicture: user.profilePicture },
      JWT_SECRET,
      { expiresIn: "59m" }
    );

    return res.json({
      status: "ok",
      data: { token, _id: user._id, userType: user.userType, stallname: user.stallname, name: user.name, id: user._id, profilePicture: user.profilePicture },
    });
  }

  res.json({ status: "error", error: "Invalid Password" });
});


app.post("/user-info", async (req, res) => {
  const { token } = req.body;

  let user;
  try {
    // First try verifying with your JWT_SECRET
    user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // If verification fails, try decoding as a Google token
    try {
      user = jwtDecode(token); // From 'jwt-decode'
    } catch (decodeErr) {
      return res.status(401).json({ status: "error", message: "Invalid or expired token" });
    }
  }

  const useremail = user.email;
  try {
    const data = await User.findOne({ email: useremail });
    if (!data) {
      return res.send({ status: "error", data: "User not found" });
    }

    return res.send({
      status: "ok",
      data: {
        _id: data._id,
        profilePicture: data.profilePicture,
        id: data.id,
        name: data.name,
        email: data.email,
        stallname: data.stallname,
        userType: data.userType,
        secretKey: data.secretKey,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.send({ status: "error", data: "Server error" });
  }
});


app.get("/getVendorLists", async (req, res) => {
  try {
    // Fetch only users with userType: "vendor"
    const vendors = await User.find(
      { userType: "vendor", authentication: "Authenticated" }, // Filter for vendor userType
      {
        id: 1,
        name: 1,
        email: 1,
        stallname: 1,
        userType: 1,
        profilePicture: 1,
      }
    );

    // Convert mongoose documents to plain objects (optional but helpful)
    const cleanedVendorDetails = vendors.map((item) => item.toObject());

    res.send({ status: "ok", data: cleanedVendorDetails });
  } catch (error) {
    console.error("Error fetching vendor lists:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch vendor lists" });
  }
});

app.get("/getUserByName", async (req, res) => {
  const { name } = req.query; // Get 'name' from the query parameters

  try {
    const user = await User.findOne({ name }); // Find user by name
    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    // Return the user's profilePicture URL
    res.send({
      status: "ok",
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error fetching user by name:", error);
    res.status(500).send({ status: "error", message: "Server error" });
  }
});

app.post("/add-product", productPicture.single("productImage"), async (req, res) => {
  const { productName, category, description, price, availableStocks, stallId } = req.body;
  const productImage = req.file ? req.file.path : null; // Uploaded image path

  try {
    const availStatus = availableStocks > 0 ? "Available" : "Not Available"; // Dynamically set availStatus

    // Create a new product document
    const newProduct = new Product({
      productImage,
      productName,
      stallId,
      category,
      description, // Added field
      price,
      availableStocks,
      availStatus,
      archive: "Not Archive",
    });

    // Save product to MongoDB
    await newProduct.save();

    res.send({ status: "ok", message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send({ status: "error", message: "Failed to add product" });
  }
});

app.get("/getProductLists", async (req, res) => {
  try {
    const { stallname } = req.query; // Get stallname from the request query

    if (!stallname) {
      return res.status(400).send({ status: "error", message: "Stall name is required" });
    }

    // Fetch products filtered by stallname
    const products = await Product.find(
      { stallname }, // Match the provided stallname
      {
        _id: 1,
        productImage: 1,
        productName: 1,
        category: 1,
        description: 1,
        price: 1,
        availableStocks: 1,
        availStatus: 1,
        stallname: 1, // Include stallname for verification
      }
    );

    // Convert Mongoose documents to plain objects
    const cleanedProducts = products.map((item) => item.toObject());

    res.send({ status: "ok", data: cleanedProducts });
  } catch (error) {
    console.error("Error fetching product lists:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch product lists" });
  }
});

app.get("/getProductListsAvailable", async (req, res) => {
  try {
    const { stallId } = req.query; // Get stallId from the request query

    if (!stallId) {
      return res.status(400).send({ status: "error", message: "Stall ID is required" });
    }

    // Fetch products filtered by stallId and availStatus
    const products = await Product.find(
      { stallId, availStatus: "Available", archive: "Not Archive" }, // Match the provided stallId and availStatus
      {
        _id: 1,
        productImage: 1,
        productName: 1,
        category: 1,
        description: 1,
        price: 1,
        availableStocks: 1,
        availStatus: 1,
        stallId: 1, // Include stallId for verification
      }
    );

    // Convert Mongoose documents to plain objects
    const cleanedProducts = products.map((item) => item.toObject());

    res.send({ status: "ok", data: cleanedProducts });
  } catch (error) {
    console.error("Error fetching product lists:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch product lists" });
  }
});

app.get("/getProduct/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({ status: "error", message: "Product not found" });
    }

    res.send({ status: "ok", data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch product" });
  }
});

// Add the PUT route for editing a product
app.put("/edit-product/:id", productPicture.single("productImage"), async (req, res) => {
  const productId = req.params.id;
  const { productName, category, description, price, availableStocks } = req.body;
  const productImage = req.file ? req.file.path : null; // Get uploaded image path

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({ status: "error", message: "Product not found" });
    }

    // Update the product fields
    product.productName = productName || product.productName;
    product.category = category || product.category;
    product.description = description || product.description;
    product.price = price || product.price;
    product.availableStocks = availableStocks || product.availableStocks;
    product.productImage = productImage || product.productImage;
    product.availStatus = availableStocks > 0 ? "Available" : "Not Available";

    // Save the updated product
    await product.save();

    res.send({ status: "ok", message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send({ status: "error", message: "Failed to update product" });
  }
});

app.get("/getVendorDetails/:stallId", async (req, res) => {
  const stallId = req.params.stallId; // Get the stall ID from the URL parameter

  try {
    // Find stall details using the stall ID
    const stall = await User.findById(stallId); // Replace `Vendor` with the correct MongoDB collection model

    if (!stall) {
      return res.status(404).send({ status: "error", message: "Stall not found" });
    }

    res.send({ status: "ok", data: stall });
  } catch (error) {
    console.error("Error fetching stall details:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch stall details" });
  }
});

app.post("/api/orders/place-order", async (req, res) => {
  const { stallId, items, totalAmount } = req.body;
  const orderBy = req.body.orderBy || "Guest";
  const orderById = req.body.orderById || "Guest";

  // Validate required fields
  if (!stallId || !items || !totalAmount || !orderBy || !orderById) {
    return res.status(400).send({
      status: "error",
      message: "Missing required fields: stallId, items, totalAmount, orderBy, or orderById",
    });
  }

  try {
    // Check product availability first
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).send({
          status: "error",
          message: `Product with ID ${item.productId} not found.`,
        });
      }

      if (product.availableStocks < item.quantity) {
        return res.status(400).send({
          status: "error",
          message: `The product "${product.productName}" is insufficient. Please try again!`,
        });
      }
    }

    // Get the next ticket number using a counter collection
    const counter = await Counter.findOneAndUpdate(
      { name: "orderTicket" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const ticketNumber = counter.seq;

      // Get stall details to retrieve the stallname
      const stall = await mongoose.model("UserInfo").findById(stallId);

      if (!stall) {
        return res.status(404).send({
          status: "error",
          message: "Stall not found.",
        });
      }

      const stallname = stall.stallname || "Unknown Stall"; // fallback if stallname is missing

      // Create a new order document including stallname
      const newOrder = new Order({
        stallId,
        stallname, // ✅ Include the stallname
        items,
        totalAmount,
        ticketNumber,
        orderBy,
        orderById,
        status: "Incoming",
      });

    // Save the order to the database
    await newOrder.save();

    // Update the availableStocks for each product
    for (const item of items) {
      const product = await Product.findById(item.productId);
      product.availableStocks = Math.max(product.availableStocks - item.quantity, 0);
      product.availStatus = product.availableStocks > 0 ? "Available" : "Not Available";
      await product.save();
    }

    res.send({
      status: "ok",
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send({
      status: "error",
      message: "Failed to place order",
    });
  }
});



app.get("/api/orders/get-orders", async (req, res) => {
  const { stallId } = req.query;

  if (!stallId) {
    return res.status(400).send({ status: "error", message: "Missing stallId" });
  }

  try {
    const orders = await Order.find({ stallId }).populate("items.productId");
    
    if (!orders.length) {
      return res.status(404).send({ status: "error", message: "No orders found" });
    }

    res.send({ status: "ok", orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch orders" });
  }
});


app.delete("/api/orders/cancel-order", async (req, res) => {
  const { orderId } = req.body; // Get the order ID from the request body

  if (!orderId) {
    return res.status(400).send({ status: "error", message: "Missing orderId" });
  }

  try {
    // Fetch the order to update stock
    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return res.status(404).send({ status: "error", message: "Order not found" });
    }

    // Loop through the order items and update the stock of the products
    for (const item of order.items) {
      const product = await Product.findById(item.productId._id);

      if (!product) {
        console.error(`Product with ID ${item.productId._id} not found`);
        continue;
      }

      // Add back the canceled quantity to the product's stock
      product.availableStocks += item.quantity;
      product.availStatus = product.availableStocks > 0 ? "Available" : "Not Available";

      // Save the product with updated stock
      await product.save();
    }

    // Remove the order from the database
    await Order.findByIdAndDelete(orderId);

    res.send({ status: "ok", message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).send({ status: "error", message: "Failed to cancel order" });
  }
});

app.patch("/api/orders/complete-order", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).send({ status: "error", message: "Missing orderId" });
  }

  try {
    // Find the order and update the status to "Completed"
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "readyForPickup" },
      { new: true } // This returns the updated order
    );

    if (!order) {
      return res.status(404).send({ status: "error", message: "Order not found" });
    }

    // Send the updated order back in the response
    res.send({ status: "ok", message: "Order completed successfully", order });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).send({ status: "error", message: "Failed to complete order" });
  }
});

app.patch("/api/orders/complete-orderemail", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).send({ status: "error", message: "Missing orderId" });
  }

  try {
    // Find the order and update the status to "Completed"
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "readyForPickup" },
      { new: true } // This returns the updated order
    );

    if (!order) {
      return res.status(404).send({ status: "error", message: "Order not found" });
    }

    // Find the user (orderBy) from the UserInfo collection
    const user = await User.findOne({ name: order.orderBy });

    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found for this order" });
    }

    // Configure nodemailer transporter
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth:{
        user: 'nmpcunofficial@gmail.com',
        //pass: 'uijo kjzi hapc ltpo'

      }
    });

    var mailOptions = {
      from: 'youremail@gmail.com',
      to: 'aranomichael6@gmail.com',
      subject: 'Password Reset',
      //text: `Hi ${user.name},\n\nYour order with ticket number ${order.ticketNumber} has been completed. Thank you for using our service!\n\nBest regards,\nYour Team`,
      text: `Hi,\n\nYour order has been completed. Thank you for using our service!\n\nBest regards,\nYour Team`,
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error){
        console.log(error);
      }else{
        console.log('Email sent' + info.response);
      }     
    });
    console.log(link);
  }catch (error){}
});






// Fetch the list of vendors/stalls for the dropdown
app.get("/getVendorListsQueue", async (req, res) => {
  try {
    const vendors = await User.find({ userType: "vendor", authentication: "Authenticated" }).select('_id stallname'); // Select stall ID and stallname
    res.send({ status: "ok", data: vendors });
  } catch (error) {
    console.error("Error fetching vendor lists:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch vendor lists" });
  }
});

// Fetch orders based on stallId
app.get("/api/orders/get-ordersQueue", async (req, res) => {
  const { stallId } = req.query;

  if (!stallId) {
    return res.status(400).send({ status: "error", message: "Missing stallId" });
  }

  try {
    const orders = await Order.find({ stallId }).sort({ ticketNumber: -1 }); // Sort by ticketNumber descending to get the latest orders
    res.send({ status: "ok", orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch orders" });
  }
});


app.get("/api/orders/live-queue/:stallId", async (req, res) => {
  const { stallId } = req.params;

  try {
    // Fetch orders for the given stallId
    const orders = await Order.find({ stallId });

    if (!orders.length) {
      return res.status(404).send({ status: "error", message: "No orders found for this stall" });
    }

    // Extract ticket numbers and classify them
    const nowServing = orders
      .filter((order) => order.status === "inProgress")
      .map((order) => order.ticketNumber);
    const readyForPickup = orders
      .filter((order) => order.status === "Completed")
      .map((order) => order.ticketNumber);

    res.send({
      status: "ok",
      data: {
        nowServing,
        readyForPickup,
        currentTicket: orders[orders.length - 1]?.ticketNumber || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching live queue:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch live queue" });
  }
});

// Fetch user data by ID
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ status: "error", message: "Server error" });
  }
});

// Update user data
app.put("/edituser/:id", upload.single("profilePicture"), async (req, res) => {
  const { name, email, college, member, age, yearLevel } = req.body;
  const profilePicturePath = req.file ? req.file.path : null;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    user.college = college || user.college;
    user.member = member || user.member;
    user.age = age || user.age;
    user.yearLevel = yearLevel || user.yearLevel;
    
    if (profilePicturePath) {
      user.profilePicture = profilePicturePath;
    }

    await user.save();
    res.send({ status: "ok" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ status: "error", message: "Update failed" });
  }
});

// Update user data
app.put("/editvendor/:id", upload.single("profilePicture"), async (req, res) => {
  const { name, email, stallname } = req.body;
  const profilePicturePath = req.file ? req.file.path : null;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    user.stallname = stallname || user.stallname;
    if (profilePicturePath) {
      user.profilePicture = profilePicturePath;
    }

    await user.save();
    res.send({ status: "ok" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ status: "error", message: "Update failed" });
  }
});



app.get("/getstallname/:id", async (req, res) => {
  try {
    // Find user by ID and retrieve only the "stallname" field
    const user = await User.findById(req.params.id).select("stallname");
    if (user) {
      res.send({ stallname: user.stallname });
    } else {
      res.status(404).send({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ status: "error", message: "Server error" });
  }
});






//Added Codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
// Fetch stall names based on orderBy and status "Completed"
app.get("/api/stallnames", async (req, res) => {
  const { orderById } = req.query;

  if (!orderById) {
    return res.status(400).send({ status: "error", message: "Missing orderById" });
  }

  try {
    // Use MongoDB's aggregation to match and join collections
    const stallnames = await Order.aggregate([
      // Match orders by orderBy and status "Completed"
      {
        $match: {
          orderById,
          status: "Completed",
        },
      },
      // Lookup to join userInfo based on stallId and _id
      {
        $lookup: {
          from: "UserInfo", // Name of the collection for userInfo
          localField: "stallId", // Field in orderInfo
          foreignField: "_id", // Field in userInfo
          as: "stallDetails", // Output array field name
        },
      },
      // Unwind the stallDetails array to extract objects
      { $unwind: "$stallDetails" },
      // Project only the stallname field
      {
        $project: {
          _id: 0, // Exclude the _id field
          stallID: "$stallDetails._id", // Include stallID
          stallname: "$stallDetails.stallname", // Include stallname
        },
      },
    ]);

    if (stallnames.length === 0) {
      return res.status(404).send({ status: "error", message: "No stallnames found" });
    }

    res.send({ status: "ok", stallnames });
  } catch (error) {
    console.error("Error fetching stallnames:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch stallnames" });
  }
});

app.get("/api/orders/completed", async (req, res) => {
  const { orderById, page = 1, limit = 10 } = req.query;
  
  if (!orderById) {
    return res.status(400).send({ status: "error", message: "Missing orderBy" });
  }

  try {
    const skip = (page - 1) * limit; // Skip based on current page
    const completedOrders = await Order.find({ status: "Completed", orderById })
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total number of orders to calculate totalPages
    const totalOrders = await Order.countDocuments({ status: "Completed", orderById });

    res.send({
      status: "ok",
      orders: completedOrders,
      totalOrders, // Send the total number of orders
    });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch completed orders" });
  }
});

app.get("/api/orders/completedbystall", async (req, res) => {
  const { stallId, page = 1, limit = 10 } = req.query;
  
  if (!stallId) {
    return res.status(400).send({ status: "error", message: "Missing orderBy" });
  }

  try {
    const skip = (page - 1) * limit; // Skip based on current page
    const completedOrders = await Order.find({ status: "Completed", stallId })
      .skip(skip)
      .limit(parseInt(limit));

    // Get the total number of orders to calculate totalPages
    const totalOrders = await Order.countDocuments({ status: "Completed", stallId });

    res.send({
      status: "ok",
      orders: completedOrders,
      totalOrders, // Send the total number of orders
    });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch completed orders" });
  }
});



//------------------------Added Code------------------------

// Archive product
app.put("/archive-product/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ status: "error", message: "Product not found" });
    }

    product.archive = "Archived"; // Change archive field to "Archived"
    await product.save();

    res.send({ status: "ok", message: "Product archived successfully" });
  } catch (error) {
    console.error("Error archiving product:", error);
    res.status(500).send({ status: "error", message: "Failed to archive product" });
  }
});

// Restore product
app.put("/restore-product/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ status: "error", message: "Product not found" });
    }

    product.archive = "Not Archive"; // Change archive field to "Not Archive"
    await product.save();

    res.send({ status: "ok", message: "Product restored successfully" });
  } catch (error) {
    console.error("Error restoring product:", error);
    res.status(500).send({ status: "error", message: "Failed to restore product" });
  }
});

app.get("/getProductListsArchive", async (req, res) => {
  try {
    const { stallId, archive } = req.query; // Add archive filter to query

    if (!stallId) {
      return res.status(400).send({ status: "error", message: "Stall name is required" });
    }

    const query = { stallId, archive: archive || "Not Archive" }; // Default to "Not Archive"
    const products = await Product.find(query, {
      _id: 1,
      productImage: 1,
      productName: 1,
      category: 1,
      description: 1,
      price: 1,
      availableStocks: 1,
      availStatus: 1,
      stallId: 1,
      archive: 1,
    });

    res.send({ status: "ok", data: products.map((item) => item.toObject()) });
  } catch (error) {
    console.error("Error fetching product lists:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch product lists" });
  }
});

app.get("/api/users/get-user", async (req, res) => {
  const { id } = req.query; // Extract the user ID from the query parameters

  if (!id) {
    return res.status(400).send({ status: "error", message: "Missing user ID" });
  }

  try {
    // Fetch the user from the UserInfo collection using the ID
    const user = await User.findById(id).select("name");

    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    // Send the user's name in the response
    res.send({ status: "ok", user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch user" });
  }
});

app.post("/api/orders/send-cancel-email", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).send({ status: "error", message: "Missing orderId" });
  }

  try {
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ status: "error", message: "Order not found" });
    }

    // Find the user by orderById
    const user = await User.findById(order.orderById);
    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "my.canteenofficial@gmail.com", // Replace with your Gmail
        pass: "ulxo bpmf lbjj jopg", // Replace with your app password
      },
    });

    // Send an email notification
    const mailOptions = {
      from: "your-email@gmail.com", // Replace with your email
      to: user.email,
  subject: "🚫 Order Cancellation Notification 🚫",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
      <h2 style="color: #d32f2f; text-align: center;">❌ Order Cancellation Notice ❌</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>We regret to inform you that your order with <strong>Ticket Number: ${order.ticketNumber}</strong> has been <strong style="color: #d32f2f;">canceled</strong> by the vendor.</p>

      <h3 style="color: #333;">📋 Order Details:</h3>
      <ul style="background: #fff; padding: 10px; border-radius: 5px;">
            ${order.items.map(item => `
              <li style="margin-bottom: 10px;">
                <strong>${item.quantity}x ${item.productName}</strong> - ₱${(item.price * item.quantity).toFixed(2)}
                ${item.notes ? `<br/><em style="color: #555;">Notes: ${item.notes}</em>` : ""}
              </li>
            `).join("")}
      </ul>

      <p style="font-size: 18px; font-weight: bold; text-align: center; margin-top: 20px;">
        Total Amount: ₱${order.totalAmount.toFixed(2)}
      </p>

      <p>We apologize for any inconvenience this may have caused. If you have any concerns, please feel free to contact us.</p>

      <p style="text-align: center; font-weight: bold; color: #d32f2f; font-size: 16px;">
        <span>We hope to serve you again soon.</span>
      </p>

      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated email, please do not reply.</p>
    </div>
  `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send({ status: "error", message: "Failed to send email" });
      }

      console.log("Email sent:", info.response);
      res.send({ status: "ok", message: "Email sent successfully" });
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ status: "error", message: "Failed to send email" });
  }
});

app.post("/api/orders/send-complete-email", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).send({ status: "error", message: "Missing orderId" });
  }

  try {
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ status: "error", message: "Order not found" });
    }

    // Find the user by orderById
    const user = await User.findById(order.orderById);
    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    // Fetch the stallname from the stallId
    const stall = await User.findById(order.stallId);
    if (!stall) {
      return res.status(404).send({ status: "error", message: "Stall not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "my.canteenofficial@gmail.com", // Replace with your Gmail
        pass: "ulxo bpmf lbjj jopg", // Replace with your app password
      },
    });

    // Construct the email content with HTML
    const mailOptions = {
      from: "my.canteenofficial@gmail.com",
      to: user.email,
      subject: "🎉 Your Order is Ready for Pickup! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
          <h2 style="color: #a00000; text-align: center;">🍽 Order Completion Notification 🍽</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Great news! Your order with <strong>Ticket Number: ${order.ticketNumber}</strong> from <strong>${stall.stallname}</strong> is now ready for pickup. 🎉</p>
          
          <h3 style="color: #333;">🛒 Order Summary:</h3>
          <ul style="background: #fff; padding: 10px; border-radius: 5px;">
            ${order.items.map(item => `
              <li style="margin-bottom: 10px;">
                <strong>${item.quantity}x ${item.productName}</strong> - ₱${(item.price * item.quantity).toFixed(2)}
                ${item.notes ? `<br/><em style="color: #555;">Notes: ${item.notes}</em>` : ""}
              </li>
            `).join("")}
          </ul>
    
      <p style="font-size: 18px; font-weight: bold; text-align: center; margin-top: 20px;">
        Total Amount: ₱${order.totalAmount.toFixed(2)}
      </p>
    
          <p>Please visit our stall to collect your items. Thank you for choosing <strong>${stall.stallname}</strong>!</p>
    
          <p style="text-align: center; font-weight: bold; color: #a00000; font-size: 16px;">
            <span>Visit Us Again</span>
          </p>
    
          <p style="font-size: 12px; color: #777; text-align: center;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send({ status: "error", message: "Failed to send email" });
      }

      console.log("Email sent:", info.response);
      res.send({ status: "ok", message: "Email sent successfully" });
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ status: "error", message: "Failed to send email" });
  }
});

app.get("/api/orders/get-orders-completed-list", async (req, res) => {
  const { stallId } = req.query;

  if (!stallId) {
    return res.status(400).send({ status: "error", message: "Missing stallId" });
  }

  try {
    // Find orders for the specified stallId and filter by status "Completed"
    const orders = await Order.find({ stallId, status: "Completed" }).populate("items.productId");

    res.send({ status: "ok", orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch orders" });
  }
});

app.get("/api/orders/get-available-years", async (req, res) => {
  const { stallId } = req.query;
  try {
    const orders = await Order.find({ stallId }).select("createdAt");
    const years = [...new Set(orders.map(order => new Date(order.createdAt).getFullYear()))];
    res.json({ years });
  } catch (error) {
    res.status(500).json({ message: "Error fetching years" });
  }
});

app.get("/api/orders/get-orders-completed-list-by-year", async (req, res) => {
  const { stallId, year } = req.query;
  try {
    const orders = await Order.find({
      stallId, status: "Completed",
      "createdAt": {
        $gte: new Date(`${year}-01-01`), // From the start of the selected year
        $lt: new Date(`${parseInt(year) + 1}-01-01`), // Until the start of the next year
      }
    }).exec();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Add Goal Data for a User
app.post("/save-goals", async (req, res) => {
  const { userId, goals } = req.body;

  try {
    // Check if goal data already exists for the user
    let existingGoalData = await GoalData.findOne({ userId });

    if (existingGoalData) {
      // Update existing goal data
      existingGoalData.goals = goals; // Update the goals map
      await existingGoalData.save();
      return res.send({ status: "ok", message: "Goals updated successfully" });
    } else {
      // Create new goal data for the user
      const newGoalData = new GoalData({
        userId,
        goals,
      });
      await newGoalData.save();
      return res.send({ status: "ok", message: "Goals saved successfully" });
    }
  } catch (error) {
    console.error("Error saving goals:", error);
    res.send({ status: "error", message: "Failed to save goals" });
  }
});

// Get Goal Data for a User
app.post("/get-goals", async (req, res) => {
  const { userId } = req.body;

  try {
    const goalData = await GoalData.findOne({ userId });

    if (goalData) {
      return res.send({ status: "ok", data: goalData.goals });
    } else {
      return res.send({ status: "error", message: "No goals found for the user" });
    }
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.send({ status: "error", message: "Failed to fetch goals" });
  }
});


app.patch("/api/orders/update-status", async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).send({ status: "error", message: "Missing orderId or status" });
  }

  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).send({ status: "error", message: "Order not found" });
    }

    res.send({ status: "ok", message: `Order updated to ${status}`, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send({ status: "error", message: "Failed to update order status" });
  }
});



/*Capstone Revision New Code*/
// This endpoint gets products with 'Not Available' status
app.get("/getProductListsCombined", async (req, res) => {
  try {
    const { stallId } = req.query;

    if (!stallId) {
      return res.status(400).send({ status: "error", message: "Stall ID is required" });
    }

    // Fetch both Available and Not Available products
    const products = await Product.find(
      { stallId, archive: "Not Archive" }, // Fetch all except archived
      {
        _id: 1,
        productImage: 1,
        productName: 1,
        category: 1,
        description: 1,
        price: 1,
        availableStocks: 1,
        availStatus: 1,
        stallId: 1,
      }
    );

    const cleanedProducts = products.map((item) => item.toObject());

    // Sort alphabetically by productName
    cleanedProducts.sort((a, b) => a.productName.localeCompare(b.productName));

    res.send({ status: "ok", data: cleanedProducts });
  } catch (error) {
    console.error("Error fetching combined product lists:", error);
    res.status(500).send({ status: "error", message: "Failed to fetch product lists" });
  }
});


/** Added Code */

app.patch("/api/orders/cancel-order-queue", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).send({ status: "error", message: "Missing orderId" });
  }

  try {
    // Fetch the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ status: "error", message: "Order not found" });
    }

    if (order.status !== "Incoming") {
      return res.status(400).send({ status: "error", message: "Only 'Incoming' orders can be cancelled." });
    }



       // Loop through the order items and update the stock of the products
       for (const item of order.items) {
        const product = await Product.findById(item.productId._id);
  
        if (!product) {
          console.error(`Product with ID ${item.productId._id} not found`);
          continue;
        }
  
        // Add back the canceled quantity to the product's stock
        product.availableStocks += item.quantity;
        product.availStatus = product.availableStocks > 0 ? "Available" : "Not Available";
  
        // Save the product with updated stock
        await product.save();
      }

    // Set status to "Cancelled"
    order.status = "Cancelled";
    await order.save();

    // Find the user
    const user = await User.findById(order.orderById);
    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "my.canteenofficial@gmail.com",
        pass: "ulxo bpmf lbjj jopg",
      },
    });

    const mailOptions = {
      from: "my.canteenofficial@gmail.com",
      to: user.email,
      subject: "🛑 Order Cancelled by You",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
          <h2 style="color: #d32f2f; text-align: center;">Order Cancelled</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have successfully <strong style="color: #d32f2f;">cancelled</strong> your order with Ticket Number <strong>${order.ticketNumber}</strong>.</p>
          <p>Thank you for using MyCanteen. We hope to serve you again soon!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.send({ status: "ok", message: "Order cancelled and email sent." });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).send({ status: "error", message: "Server error while cancelling order." });
  }
});


app.get("/get-user-order/:stallId", async (req, res) => {
  const { stallId } = req.params;
  const { name } = req.query;

  if (!stallId || !name) {
    return res.status(400).json({ status: "error", message: "Missing stallId or name" });
  }

  try {
    // Step 1: Find user by name
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(404).json({ status: "no_user", message: "User not found." });
    }

    // Step 2: Find latest Incoming order for this user and stall
    const order = await Order.findOne({
      stallId: new mongoose.Types.ObjectId(stallId),
      orderById: user._id,
      status: "Incoming",
    }).sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({ status: "no_order", message: "No active order found." });
    }

    res.json({ status: "ok", order });

  } catch (error) {
    console.error("Error fetching user order:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch user order." });
  }
});


// In app.js
app.get("/getAllProducts", async (req, res) => {
  try {
    const vendors = await User.find({ userType: "vendor" });
    const stallMap = vendors.reduce((map, vendor) => {
      map[vendor._id] = vendor.stallname;
      return map;
    }, {});

    const products = await Product.find({ archive: "Not Archive" });
    const withStallNames = products
      .map(p => ({
        ...p.toObject(),
        stallName: stallMap[p.stallId] || "Unknown Stall"
      }))
      .filter(p => p.stallName !== "Unknown Stall"); // ✅ filter out unknown stalls

    res.send({ status: "ok", data: withStallNames });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Failed to fetch all products" });
  }
});



app.post("/google-login", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ status: "error", message: "Missing credential token" });
  }

  try {
    // Decode the Google credential token
    const decoded = jwtDecode(credential);
    const email = decoded.email;

    if (!email) {
      return res.status(400).json({ status: "error", message: "Email not found in token" });
    }

    // Match email with database (UserInfo collection)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "You must register first before you log in!",
      });
    }

    // Optional: Check if user is authenticated if your app uses it
    if (user.authentication !== "Authenticated") {
      return res.status(403).json({
        status: "error",
        message: "User is not authenticated. Please register first before you log in!",
      });
    }

    if (user.userType !== "customer" && user.userType !== "vendor" && user.userType !== "admin")  {
      return res.status(403).json({
        status: "error",
        message: "User is not authenticated. Please register first before you login!",
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "Your account is now log in!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        stallname: user.stallname,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});


app.post("/registervendor", upload.single("profilePicture"), async (req, res) => {
  const { name, email, password, userType, stallname, authentication } = req.body;
  const profilePicturePath = req.file ? req.file.path : null;

  if (!name || !email || !password || !userType || !stallname) {
    return res.status(400).json({ status: "error", message: "Missing required fields" });
  }

  try {
    if (await User.findOne({ email })) return res.status(400).json({ status: "email_exists" });
    if (await User.findOne({ name })) return res.status(400).json({ status: "name_exists" });

    const encryptedPassword = await bcrypt.hash(password, 10);
    const secretNumber = null; // Vendor doesn't need verification code

    const newUser = await User.create({
      name,
      email,
      password: encryptedPassword,
      userType,
      stallname,
      profilePicture: profilePicturePath,
      authentication,
      secretNumber,
    });

    res.json({ status: "pending_verification" });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ status: "error", message: "Registration failed" });
  }
});


// In your Express app or vendor controller file

app.get("/countActiveVendors", async (req, res) => {
  try {
    const count = await User.countDocuments({
      userType: "vendor",
      authentication: "Authenticated",
    });

    res.status(200).json({ status: "ok", count });
  } catch (error) {
    console.error("Error counting active vendors:", error);
    res.status(500).json({ status: "error", message: "Failed to count active vendors" });
  }
});


// Reuse your existing `upload` middleware for vendor profile picture
app.put("/edit-vendor", upload.single("profilePicture"), async (req, res) => {
  const { id, name, email, password, stallname } = req.body;

  if (!id || !name || !email || !stallname) {
    return res.status(400).json({ status: "error", message: "Missing required fields" });
  }

  try {
    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({ status: "error", message: "Vendor not found" });
    }

    vendor.name = name;
    vendor.email = email;
    vendor.stallname = stallname;

    if (req.file) {
      vendor.profilePicture = req.file.path;
    }

    if (password && password.trim() !== "") {
      vendor.password = await bcrypt.hash(password, 10);
    }

    await vendor.save();

    res.json({ status: "ok", message: "Vendor updated successfully" });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ status: "error", message: "Server error during update" });
  }
});


app.delete('/delete-vendor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedVendor = await User.findByIdAndDelete(id);
    if (!deletedVendor) {
      return res.status(404).json({ status: 'error', message: 'Vendor not found' });
    }
    res.json({ status: 'ok', message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete vendor' });
  }
});



// Update user data
app.put("/editadmin/:id", upload.single("profilePicture"), async (req, res) => {
  const { name, email } = req.body;
  const profilePicturePath = req.file ? req.file.path : null;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    if (profilePicturePath) {
      user.profilePicture = profilePicturePath;
    }

    await user.save();
    res.send({ status: "ok" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ status: "error", message: "Update failed" });
  }
});


