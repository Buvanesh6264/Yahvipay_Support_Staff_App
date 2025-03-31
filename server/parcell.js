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




// const generateParcelNumber = () => {
//   const timestamp = Date.now().toString().slice(-6); 
//   const randomSuffix = Math.floor(1000 + Math.random() * 9000);
//   return `PCL${timestamp}${randomSuffix}`; 
// };
// function authenticateToken1(req, res, next) {
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];

  // if (!token) {
  //   return res.status(401).json({ error: "Unauthorized: No token provided" });
  // }

  // jwt.verify(token, JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ error: "Forbidden: Invalid token" });
  //   req.user = user; 
  //   next();
  // });
// }

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
  }finally {
    await client.close();
  }
});

// router.post("/addparcel", authenticateToken1, async (req, res) => {
//   try {
//     const { pickupLocation, destination, agentid, userid, devices, accessories, reciver, sender } = req.body;
//     const supportid = req.supportid.id;

//     if (!pickupLocation || !destination || !devices || devices.length !== 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Pickup location, destination, device IDs are required",
//         status_code: 400,
//       });
//     }

//     await client.connect();
//     const db = client.db(dbName);
//     const Device = db.collection(devicesCollection);
//     const Accessory = db.collection(accessoriesCollection);
//     const Parcel = db.collection(parcelCollection);

//     for (let deviceid of devices) {
//       const device = await Device.findOne({ deviceid });
//       if (!device) {
//         return res.status(400).json({
//           status: "error",
//           message: `Device ${deviceid} not found`,
//           status_code: 400,
//         });
//       }
//       if (device.status !== "available") {
//         return res.status(400).json({
//           status: "error",
//           message: `Device ${deviceid} is not available`,
//           status_code: 400,
//         });
//       }
//     }

//     for (let accessoryId of accessories) {
//       const accessory = await Accessory.findOne({ accessoryid: accessoryId });
//       if (!accessory || accessory.quantity <= 0) {
//         return res.status(400).json({
//           status: "error",
//           message: `Accessory ${accessoryId} is out of stock`,
//           status_code: 400,
//         });
//       }
//     }

//     const parcelNumber = generateParcelNumber();
//     await Parcel.insertOne({
//       parcelNumber,
//       pickupLocation,
//       destination,
//       agentid,
//       supportid,
//       userid,
//       devices,
//       accessories,
//       reciver,
//       sender,
//     });

//     for (let deviceid of devices) {
//       await Device.updateOne(
//         { deviceid },
//         {
//           $set: {
//             status: "assigned",
//             supportid,
//             agentid,
//             userid,
//             inventory: false,
//           },
//         }
//       );
//     }

//     for (let accessoryId of accessories) {
//       await Accessory.updateOne(
//         { accessoryid: accessoryId },
//         { $inc: { quantity: -1 } }
//       );
//     }

//     res.status(201).json({
//       status: "success",
//       message: "Parcel added successfully",
//       status_code: 201,
//     });
//   } catch (error) {
//     console.error("Parcel Addition Error:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       status_code: 500,
//     });
//   }finally {
//     await client.close();
//   }
// });


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
    }finally {
      await client.close();
    }
});



router.get("/parcelcount", async (req, res) => {
    try {
      // const supportid = req.user.supportid;
  
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(parcelCollection);
  
      const parcels = await collection.find({}).toArray();
      const count =parcels.length;
      console.log(count)
      res.status(200).json({
        status: "success",
        message: "Parcels count retrieved successfully",
        data: count,
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
    }finally {
      await client.close();
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
    }finally {
      await client.close();
    }
});

module.exports = router;
