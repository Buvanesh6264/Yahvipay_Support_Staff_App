const express = require("express");
require("dotenv").config();
const cors = require("cors");

const userRoutes = require("./user.js");
const deviceRoutes = require("./device.js");
const parcellRoutes = require("./parcell.js");
const trackingRoutes = require("./tracking.js");
const accessories = require("./accessory.js");
const addparcel = require("./addparcel.js");
const updateparcel = require("./updateparcel.js");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/user", userRoutes);
app.use("/device", deviceRoutes); 
app.use("/parcel", parcellRoutes);
app.use("/tracking", trackingRoutes);
app.use("/accessory", accessories);
app.use("/addparcel", addparcel);
app.use("/update", updateparcel);


app.get("/", (req, res) => {
  res.status(200).send("Server is running...");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
