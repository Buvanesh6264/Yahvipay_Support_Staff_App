const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const parcelCollection = process.env.PARCEL_COLLECTION;
const trackingCollection = process.env.TRACKING_COLLECTION;
const client = new MongoClient(uri);

const calculateExpectedDelivery = (status, pickupDate) => {
  let expectedDays = 5; 

  if (status === "In Transit") expectedDays = 3;
  else if (status === "Out for Delivery") expectedDays = 1;
  else if (status === "Delivered") return pickupDate;

  let deliveryDate = new Date(pickupDate);
  deliveryDate.setDate(deliveryDate.getDate() + expectedDays);
  return deliveryDate.toISOString();
};

router.post("/generate", async (req, res) => {
  try {
    const { parcelNumber } = req.body;
    if (!parcelNumber) {
      return res.status(400).json({ status: "error", message: "Parcel number is required." });
    }

    await client.connect();
    const db = client.db(dbName);
    const parcelCol = db.collection(parcelCollection);
    const trackingCol = db.collection(trackingCollection);

    const existingTracking = await trackingCol.findOne({ parcelNumber });
    if (existingTracking) {
      return res.status(400).json({ status: "error", message: "Tracking already exists for this parcel number." });
    }

    const parcel = await parcelCol.findOne({ parcelNumber });
    if (!parcel) {
      return res.status(404).json({ status: "error", message: "Parcel not found." });
    }

    const { pickupLocation, destination, status } = parcel;
    const pickupDate = new Date(); 

    const trackingHistory = [
      { status: "Picked Up", location: pickupLocation, timestamp: new Date(pickupDate).toISOString() },
      { status: "In Transit", location: "Checkpoint 1", timestamp: new Date(pickupDate.getTime() + 4 * 60 * 60 * 1000).toISOString() }, 
      { status: "Out for Delivery", location: destination, timestamp: new Date(pickupDate.getTime() + 8 * 60 * 60 * 1000).toISOString() } 
    ];

    const finalStatus = trackingHistory[trackingHistory.length - 1].status;

    const expectedDelivery = calculateExpectedDelivery(finalStatus, pickupDate);

    const trackingData = {
      parcelNumber,
      status: finalStatus,
      trackingHistory,
      expectedDelivery,
      createdAt: pickupDate.toISOString(),
      updatedAt: new Date().toISOString()
    };

    await trackingCol.insertOne(trackingData);

    res.status(201).json({
      status: "success",
      message: "Tracking history created successfully",
      data: trackingData
    });

  } catch (error) {
    console.error("Tracking API Error:", error);
    res.status(500).json({ status: "error", message: "Internal server error." });
  }finally {
    if (client) await client.close();
  }
});


// router.get("/trackingcount", async (req, res) => {
//   try {
//     // const supportid = req.user.supportid;

//     await client.connect();
//     const db = client.db(dbName);
//     const collection = db.collection(trackingCollection);
//     const parcels = await collection.find({ status: { $ne: "Out for Delivery" } }).toArray();
//     const count =parcels.length;
//     console.log(count)
//     res.status(200).json({
//       status: "success",
//       message: "Parcels count retrieved successfully",
//       data: count,
//       status_code: 200,
//     });
//   } catch (error) {
//     console.error("Fetch Support Parcels Error:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       description: "Something went wrong on the server",
//       status_code: 500,
//     });
//   }finally {
//     await client.close();
//   }
// });

router.post("/parcelNumber", async (req, res) => {
    try {
      const { parcelNumber } = req.body;
      
      await client.connect();
      const db = client.db(dbName);
      const trackingCol = db.collection(trackingCollection);
  
      let trackingData = await trackingCol.findOne({ parcelNumber });
  
      if (!trackingData) {
        return res.status(404).json({ status: "error", message: "Tracking details not found." });
      }
  
      let currentTime = new Date();
  
      let latestStatus = "Pending";
      let latestLocation = "Unknown";
      let expectedDelivery = trackingData.expectedDelivery;
  
      for (let history of trackingData.trackingHistory) {
        let historyTime = new Date(history.timestamp);
  
        if (historyTime <= currentTime) {
          latestStatus = history.status;
          latestLocation = history.location;
        }
      }
  
      // if (latestStatus === "Out for Delivery") {
      //   let deliveryDate = new Date(currentTime);
      //   deliveryDate.setDate(deliveryDate.getDate() + 1);
      //   expectedDelivery = deliveryDate.toISOString();
      // }
  
      res.status(200).json({
        status: "success",
        message: "Tracking details retrieved successfully",
        data: {
          parcelNumber,
          currentStatus: latestStatus,
          currentLocation: latestLocation,
          trackingHistory: trackingData.trackingHistory,
          expectedDelivery,
          createdAt: trackingData.createdAt,
          updatedAt: new Date().toISOString(),
        }
      });
  
    } catch (error) {
      console.error("Fetch Tracking Error:", error);
      res.status(500).json({ status: "error", message: "Internal server error." });
    }
    finally {
      if (client) await client.close();
    }
  });
  

module.exports = router;