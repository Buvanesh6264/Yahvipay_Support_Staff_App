const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionNameforuser = process.env.SUPPORT_COLLECTION;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new MongoClient(uri);


function generateAccessToken(supportid) {
  return jwt.sign({ supportid }, JWT_SECRET, { expiresIn: "2h" });
}

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const errors = [];

    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^[A-Za-z\d@$!%*?&]{6,}$/;

    if (!name) {
      errors.push({ field: "name", error: "This field is required" });
    } else if (!nameRegex.test(name)) {
      errors.push({ field: "name", error: "Only letters and spaces are allowed" });
    }

    if (!phone) {
      errors.push({ field: "phone", error: "This field is required" });
    } else if (!phoneRegex.test(phone)) {
      errors.push({ field: "phone", error: "Must be a 10-digit number" });
    }

    if (!email) {
      errors.push({ field: "email", error: "This field is required" });
    } else if (!emailRegex.test(email)) {
      errors.push({ field: "email", error: "Must be a valid email format" });
    }

    if (!password) {
      errors.push({ field: "password", error: "This field is required" });
    } else if (!passwordRegex.test(password)) {
      errors.push({ field: "password", error: "Must be at least 6 characters" });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid input",
        description: "Invalid syntax for this request was provided",
        errors: errors,
        status_code: 400
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionNameforuser);

    const userExists = await collection.findOne({ phone });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
        description: "A user with this phone number is already registered",
        status_code: 400
      });
    }

    const userId = "su" + Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);

    await collection.insertOne({
      supportid: userId,
      name,
      phone,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      status_code: 201
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({
      status: "error",
      message: "Internal server error",
      description: "Something went wrong on the server",
      status_code: 400
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const errors = [];

    const phoneRegex = /^\d{10}$/;

    if (!phone) {
      errors.push({ field: "phone", error: "This field is required" });
    } else if (!phoneRegex.test(phone)) {
      errors.push({ field: "phone", error: "Must be a 10-digit number" });
    }

    if (!password) {
      errors.push({ field: "password", error: "This field is required" });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid input",
        description: "Invalid syntax for this request was provided",
        errors: errors,
        status_code: 400
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionNameforuser);

    const user = await collection.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
        description: "No account associated with this phone number",
        status_code: 400
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Invalid password",
        description: "The provided password is incorrect",
        status_code: 400
      });
    }

    const token = generateAccessToken(user.supportid);
    res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
      status_code: 200
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(400).json({
      status: "error",
      message: "Internal server error",
      description: "Something went wrong on the server",
      status_code: 400
    });
  }
});


module.exports = router;
