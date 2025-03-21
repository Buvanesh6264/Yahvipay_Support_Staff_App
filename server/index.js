const express = require("express");
require("dotenv").config();
const cors = require("cors");

const userRoutes = require("./user.js");
const deviceRoutes = require("./device.js");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/user", userRoutes);
app.use("/device", deviceRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Server is running...");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
