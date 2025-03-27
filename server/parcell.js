const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");


const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const parcelCollection = process.env.PARCEL_COLLECTION;
const accessoriesCollection = process.env.ACCESSORIES_COLLECTION;
const devicesCollection = process.env.DEVICES_COLLECTION;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new MongoClient(uri);




const generateParcelNumber = () => {
  const timestamp = Date.now().toString().slice(-6); 
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PCL${timestamp}${randomSuffix}`; 
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
      description: "No token provided",
      status_code: 401,
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden",
        description: "Invalid token",
        status_code: 403,
      });
    }
    req.user = user;
    next();
  });
};

router.get("/userparcels", authenticateToken, async (req, res) => {
  try {
    const supportid = req.user.supportid;

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(parcelCollection);

    const parcels = await collection.find({ supportid }).toArray();

    res.status(200).json({
      status: "success",
      message: "Parcels retrieved successfully",
      data: parcels,
      status_code: 200,
    });
  } catch (error) {
    console.error("Fetch Support Parcels Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      description: "Something went wrong on the server",
      status_code: 500,
    });
  }
});

router.post("/addparcel", authenticateToken, async (req, res) => {
  try {
      const {
          deviceid,
          accessories,
          pickupLocation,
          destination,
          agentid,
          userid,
          sender,
          reciver
      } = req.body;

      const supportid = req.user.supportid; 

      const errors = [];

      if (!deviceid) {
          errors.push({ field: "deviceid", error: "Device ID is required" });
      }

      if (accessories && !Array.isArray(accessories)) {
          errors.push({ field: "accessories", error: "Accessories must be an array" });
      }

      if (!pickupLocation) {
          errors.push({ field: "pickupLocation", error: "Pickup location is required" });
      }

      if (!destination) {
          errors.push({ field: "destination", error: "Destination is required" });
      }

      if (!agentid) {
          errors.push({ field: "agentid", error: "Agent ID is required" });
      }

      if (!supportid) {
          errors.push({ field: "supportid", error: "Support ID is required" });
      }

      if (!userid) {
          errors.push({ field: "userid", error: "User ID is required" });
      }

      if (!sender) {
          errors.push({ field: "sender", error: "Sender is required" });
      }

      if (!reciver) {
          errors.push({ field: "reciver", error: "Receiver is required" });
      }

      if (errors.length > 0) {
          return res.status(400).json({
              status: "error",
              message: "Invalid input",
              errors,
              status_code: 400
          });
      }

      await client.connect();
      const db = client.db(dbName);
      const parcelCol = db.collection(parcelCollection);

      let parcelNumber;
      let parcelExists;
      do {
          parcelNumber = generateParcelNumber();
          parcelExists = await parcelCol.findOne({ parcelNumber });
      } while (parcelExists);

      const newParcel = {
          parcelNumber,
          deviceid,
          accessories: accessories || [],
          pickupLocation,
          destination,
          agentid,
          supportid,
          userid,
          sender,
          reciver
      };

      await parcelCol.insertOne(newParcel);

      res.status(201).json({
          status: "success",
          message: "Parcel created successfully",
          parcel: newParcel,
          status_code: 201
      });
  } catch (error) {
      console.error("Parcel Creation Error:", error);
      res.status(500).json({
          status: "error",
          message: "Internal server error",
          description: "Something went wrong on the server",
          status_code: 500
      });
  }
});


router.get("/allparcels", async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(parcelCollection);
  
    //   let { page, limit } = req.query;
    //   page = parseInt(page) || 1;
    //   limit = parseInt(limit) || 10;
    //   const skip = (page - 1) * limit;
  
      const parcels = await collection.find().toArray();
    //   const totalParcels = await collection.countDocuments();
  
      res.status(200).json({
        status: "success",
        message: "Parcels retrieved successfully",
        data: parcels,
        // pagination: {
        //   totalParcels,
        //   currentPage: page,
        //   totalPages: Math.ceil(totalParcels / limit),
        // },
        status_code: 200,
      });
  
      client.close();
    } catch (error) {
      console.error("Fetch Parcels Error:", error);
      res.status(400).json({
        status: "error",
        message: "Internal server error",
        description: "Something went wrong on the server",
        status_code: 400,
      });
    }
});

router.get("/:parcelNumber", async (req, res) => {
    try {
        const { parcelNumber } = req.params;
        
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(parcelCollection);

        const parcel = await collection.findOne({ parcelNumber });

        if (!parcel) {
        return res.status(404).json({
            status: "error",
            message: "Parcel not found",
            description: "No parcel found with the given parcel number",
            status_code: 404,
        });
        }

        res.status(200).json({
        status: "success",
        message: "Parcel retrieved successfully",
        data: parcel,
        status_code: 200,
        });

        client.close();
    } catch (error) {
        console.error("Fetch Parcel Error:", error);
        res.status(400).json({
        status: "error",
        message: "Internal server error",
        description: "Something went wrong on the server",
        status_code: 400,
        });
    }
});




module.exports = router;
