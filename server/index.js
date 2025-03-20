const express = require("express");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 5000;
const uri = "mongodb://localhost:27017";

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
