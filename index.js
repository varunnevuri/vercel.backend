require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/AuthRoute");

const { HoldingsModel } = require("./models/HoldingsModel");
const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");

const PORT = process.env.PORT || 8080;
const URL = process.env.MONGO_URL;

// Your commented-out seed routes are fine here
// app.get("/addHoldings", ... );
// app.get("/addPositions", ... );

mongoose
  .connect(URL)
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.log(err));

// --- FIX 1: UPDATED CORS SETTINGS ---
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://vercel-frontend-ten-opal.vercel.app", // deployed frontend
      "https://vercel-dashboard-lac.vercel.app"    // deployed backend
    ],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/", authRoute);

app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

app.post("/newOrder", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  newOrder.save();
  res.send("Order saved!");
});

// --- FIX 2: ADDED /buyStock ROUTE ---
app.post("/buyStock", async (req, res) => {
  try {
    const { name, qty, price } = req.body;
    const buyQty = Number(qty);
    const buyPrice = Number(price);

    const existingHolding = await HoldingsModel.findOne({ name: name });

    if (existingHolding) {
      // If holding exists, update its quantity and average cost
      const newQty = existingHolding.qty + buyQty;
      const newAvg = (existingHolding.avg * existingHolding.qty + buyPrice * buyQty) / newQty;

      existingHolding.qty = newQty;
      existingHolding.avg = newAvg;
      existingHolding.price = buyPrice;
      await existingHolding.save();
      res.status(200).json({ success: true, message: "Holding updated" });

    } else {
      // If it's a new holding, create it
      await HoldingsModel.create({
        name: name,
        qty: buyQty,
        avg: buyPrice,
        price: buyPrice,
        net: "0.00%", 
        day: "0.00%",
      });
      res.status(201).json({ success: true, message: "Holding created" });
    }
  } catch (error) {
    console.error("Error buying stock:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// --- FIX 3: REPLACED app.listen FOR VERCEL ---

// Add a "home" route to show the API is working
app.get("/", (req, res) => {
  res.send("Backend API is running!");
});

// Export the app for Vercel
module.exports = app;