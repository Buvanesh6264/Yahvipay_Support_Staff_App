const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");

const userRoutes = require("./user.js");
const deviceRoutes = require("./device.js");
const parcellRoutes = require("./parcell.js");
const trackingRoutes = require("./tracking.js");
const accessories = require("./accessory.js");


const app = express();
const PORT = process.env.PORT;
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const parcelCollection = process.env.PARCEL_COLLECTION;
const devicesCollection = process.env.DEVICE_COLLECTION;
// const trackingCollection = process.env.TRACKING_COLLECTION;
const client = new MongoClient(uri);

app.use(express.json());
app.use(cors());
app.use("/user", userRoutes);
app.use("/device", deviceRoutes); 
app.use("/parcel", parcellRoutes);
app.use("/tracking", trackingRoutes);
app.use("/accessory", accessories);


app.get("/", (req, res) => {
  res.status(200).send("Server is running...");
});

// app.get("/dashboardcounts", async (req, res) => {
//   try {
//     await client.connect();
//     const db = client.db(dbName);
    
//     // const trackingCollectionRef = db.collection(trackingCollection);
//     const deviceCollectionRef = db.collection(devicesCollection);
//     const parcelCollectionRef = db.collection(parcelCollection);
//     const [trackingCount, availableDevicesCount, parcelCount] = await Promise.all([
//       parcelCollectionRef.countDocuments({ type:{$ne:"outgoing"},status: { $nin: ["received"] } }),
//       deviceCollectionRef.countDocuments({ status: "available" }),
//       parcelCollectionRef.countDocuments({ status: { $nin: ["delivered"] } ,type:{$ne:"incoming"}}),
//     ]);

//     res.status(200).json({
//       status: "success",
//       message: "Counts retrieved successfully",
//       data: {
//         trackingCount,
//         availableDevicesCount,
//         parcelCount,
//       },
//       status_code: 200,
//     });
//   } catch (error) {
//     console.error("Fetch Dashboard Counts Error:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       description: "Something went wrong on the server",
//       status_code: 500,
//     });
//   } finally {
//     if (client) await client.close();
//   }
// });

app.get("/allcount", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);

    const deviceCollectionRef = db.collection(devicesCollection);
    const parcelCollectionRef = db.collection(parcelCollection);

    const deviceStatusCounts = await deviceCollectionRef.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const totalDevices = await deviceCollectionRef.countDocuments();

    const parcelStatusCounts = await parcelCollectionRef.aggregate([
      {
        $match: {
          status: { $nin: ["delivered","received"] } 
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const totalParcels = await parcelCollectionRef.countDocuments({ 
      type: { $ne: "incoming" },
      status: { $nin: ["delivered","received"] } 
    });

    const incomingParcelCount = await parcelCollectionRef.countDocuments({ 
      type: { $ne: "outgoing" },
      status: { $nin: ["received"] } 
    });

    const formattedDeviceCounts = Object.fromEntries(
      deviceStatusCounts.map(item => [item._id, item.count])
    );

    const formattedParcelCounts = Object.fromEntries(
      parcelStatusCounts.map(item => [item._id, item.count])
    );

    res.status(200).json({
      status: "success",
      message: "Counts by status retrieved successfully",
      data: {
        devices: {
          total: totalDevices,
          statusCounts: formattedDeviceCounts,
        },
        parcels: {
          total: totalParcels,
          statusCounts: formattedParcelCounts,
        },
        incomingParcelCount,
      },
      status_code: 200,
    });
  } catch (error) {
    console.error("Fetch Dashboard Counts Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      description: "Something went wrong on the server",
      status_code: 500,
    });
  } finally {
    if (client) await client.close();
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
