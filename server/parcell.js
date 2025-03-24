const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const parcelCollection = process.env.PARCEL_COLLECTION;
const accessoriesCollection = process.env.ACCESSORIES_COLLECTION;
const devicesCollection = process.env.DEVICES_COLLECTION;

const generateParcelNumber = () => {
  const timestamp = Date.now().toString().slice(-6); 
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PCL${timestamp}${randomSuffix}`; 
};

router.post("/addparcel", async (req, res) => {
    try {
      const {
        deviceIds,
        accessories,
        status,
        pickupLocation,
        destination,
        trackingHistory,
        agentid,
        supportid,
        userid,
        sender,
        reciver,
      } = req.body;
  
      const client = new MongoClient(uri);
      const errors = [];
  
      const validStatus = ["Pending", "In Transit", "Delivered"];
  
      if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
        errors.push({ field: "deviceIds", error: "At least one device ID is required" });
      }
  
      if (accessories && !Array.isArray(accessories)) {
        errors.push({ field: "accessories", error: "Accessories must be an array" });
      }
  
      if (!status) {
        errors.push({ field: "status", error: "This field is required" });
      } else if (!validStatus.includes(status)) {
        errors.push({
          field: "status",
          error: `Invalid status. Allowed values: ${validStatus.join(", ")}`,
        });
      }
  
      if (!pickupLocation) {
        errors.push({ field: "pickupLocation", error: "This field is required" });
      }
  
      if (!destination) {
        errors.push({ field: "destination", error: "This field is required" });
      }
  
      if (!agentid) {
        errors.push({ field: "agentid", error: "This field is required" });
      }
  
      if (!supportid) {
        errors.push({ field: "supportid", error: "This field is required" });
      }
  
      if (!userid) {
        errors.push({ field: "userid", error: "This field is required" });
      }
  
      if (!sender) {
        errors.push({ field: "sender", error: "This field is required" });
      }
  
      if (!reciver) {
        errors.push({ field: "reciver", error: "This field is required" });
      }
  
      if (trackingHistory && !Array.isArray(trackingHistory)) {
        errors.push({ field: "trackingHistory", error: "Tracking history must be an array" });
      }
  
      if (errors.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid input",
          description: "Invalid syntax for this request",
          errors: errors,
          status_code: 400,
        });
      }
  
      await client.connect();
      const db = client.db(dbName);
      const parcelCol = db.collection(parcelCollection);
      const accessoriesCol = db.collection(accessoriesCollection);
      const devicesCol = db.collection(devicesCollection);
  
      if (sender === "yavhipay") {
        const deviceData = await devicesCol.find({ deviceid: { $in: deviceIds }, available: true }).toArray();
        const accessoriesData = await accessoriesCol.find({ accessoriesid: { $in: accessories }, quantity: { $gt: 0 } }).toArray();
  
        const unavailableDevices = deviceIds.filter(id => !deviceData.some(device => device.deviceid === id));
        const unavailableAccessories = accessories.filter(id => !accessoriesData.some(acc => acc.accessoriesid === id));
  
        if (unavailableDevices.length > 0) {
          return res.status(400).json({
            status: "error",
            message: "Unavailable Devices",
            description: `The following devices are not available: ${unavailableDevices.join(", ")}`,
            status_code: 400,
          });
        }
  
        if (unavailableAccessories.length > 0) {
          return res.status(400).json({
            status: "error",
            message: "Unavailable Accessories",
            description: `The following accessories are not in stock: ${unavailableAccessories.join(", ")}`,
            status_code: 400,
          });
        }
      }
  
      if (reciver === "yavhipay") {
        const damagedDevices = await devicesCol.find({ deviceid: { $in: deviceIds }, status: "damaged" }).toArray();
        const invalidDevices = deviceIds.filter(id => !damagedDevices.some(device => device.deviceid === id));
  
        if (invalidDevices.length > 0) {
          return res.status(400).json({
            status: "error",
            message: "Only Damaged Devices Allowed",
            description: `The following devices are not marked as damaged: ${invalidDevices.join(", ")}`,
            status_code: 400,
          });
        }
      }
  
      let parcelNumber;
      let parcelExists;
      do {
        parcelNumber = generateParcelNumber();
        parcelExists = await parcelCol.findOne({ parcelNumber });
      } while (parcelExists);
  
      const newParcel = {
        parcelNumber,
        deviceIds,
        accessories: accessories || [],
        status,
        pickupLocation,
        destination,
        trackingHistory: trackingHistory || [],
        agentid,
        supportid,
        userid,
        sender,
        reciver,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      await parcelCol.insertOne(newParcel);
  
      res.status(201).json({
        status: "success",
        message: "Parcel created successfully",
        parcel: newParcel,
        status_code: 201,
      });
  
    } catch (error) {
      console.error("Parcel Creation Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        description: "Something went wrong on the server",
        status_code: 500,
      });
    }
});

router.get("/allparcels", async (req, res) => {
    try {
      const client = new MongoClient(uri);
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
        const client = new MongoClient(uri);
        
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
