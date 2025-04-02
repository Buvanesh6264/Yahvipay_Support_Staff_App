const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const parcelCollection = process.env.PARCEL_COLLECTION;
const devicesCollection = process.env.DEVICE_COLLECTION;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new MongoClient(uri);

const authenticatetoken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token){
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

router.post("/Updateparcel", authenticatetoken, async (req, res) => {
  try {
      const { agentid, devices, parcelNumber } = req.body;
      const supportid = req.user.supportid;
      console.log(req.body)

      if (!devices || !Array.isArray(devices) || devices.length === 0) {
          return res.status(400).json({
              status: "error",
              message: "At least one device ID is required",
              status_code: 400,
          });
      }

      await client.connect();
      const db = client.db(dbName);
      const Device = db.collection(devicesCollection);
      const Parcel = db.collection(parcelCollection);

      const parcel = await Parcel.findOne({ parcelNumber });
      if (!parcel) {
          return res.status(400).json({
              status: "error",
              message: `Parcel ${parcelNumber} not found`,
              status_code: 400,
          });
      }

      for (let deviceid of devices) {
          const device = await Device.findOne({ deviceid });
          if (!device) {
              return res.status(400).json({
                  status: "error",
                  message: `Device ${deviceid} not found`,
                  status_code: 400,
              });
          }
          if (device.status !== "available") {
              return res.status(400).json({
                  status: "error",
                  message: `Device ${deviceid} is not available`,
                  status_code: 400,
              });
          }
      }

      await Parcel.updateOne(
          { parcelNumber },
          {
              $set: { agentid, supportid },
              $push: { devices: { $each: devices } } 
          }
      );

      await Promise.all(
          devices.map(deviceid =>
              Device.updateOne(
                  { deviceid },
                  {
                      $set: {
                          status: "assigned",
                          supportid,
                          agentid,
                          Inventory: false,
                      },
                  }
              )
          )
      );

      const updatedParcel = await Parcel.findOne({ parcelNumber });
      console.log("Updated Parcel:", updatedParcel);

      res.status(201).json({
          status: "success",
          message: "Parcel updated successfully",
          parcelNumber,
          status_code: 201,
      });
  } catch (error) {
      console.error("Parcel Addition Error:", error);
      res.status(500).json({
          status: "error",
          message: "Internal server error",
          status_code: 500,
      });
  } finally {
      await client.close();
  }
});


module.exports = router;
