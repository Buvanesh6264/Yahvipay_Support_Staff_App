const express = require("express");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const deviceCollection = process.env.DEVICE_COLLECTION;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new MongoClient(uri);



const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Received Auth Header:", authHeader); 

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; 
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.user = user;
    next();
  });
};

router.get("/userdevices", authenticateToken, async (req, res) => {
  try {
    const supportid = req.user.supportid;
    const { status } = req.query;

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(deviceCollection);

    const query = { supportid };
    if (status) {
      query.status = { $regex: new RegExp(`^${status}$`, "i") };
    }

    const devices = await collection.find(query).toArray();

    res.status(200).json({
      status: "success",
      message: "Devices retrieved successfully",
      data: devices,
      total_devices: devices.length,
      status_code: 200,
    });
  } catch (error) {
    console.error("Fetch Support Devices Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      description: "Something went wrong on the server",
      status_code: 500,
    });
  } finally {
    await client.close();
  }
});


router.post("/adddevice", authenticateToken, async (req, res) => {
  try {
    const { devicename, status, agentid, image, deviceid } = req.body;
    const supportid = req.user.supportid;

    if (!devicename || !status || !deviceid) {
      return res.status(400).json({
        status: "error",
        message: "Device name, status, and device ID are required",
        status_code: 400,
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(deviceCollection);
    const type = "Device";
    const existingDevice = await collection.findOne({ deviceid });

    if (existingDevice) {
      return res.status(400).json({
        status: "error",
        message: "Device already exists",
        status_code: 400,
      });
    }
    const Inventory = status === "available";
    await collection.insertOne({
      devicename,
      deviceid,
      status,
      supportid,
      agentid: status === "available" ? "" : agentid,
      Inventory,
      type,
      image: image || "",
    });

    res.status(201).json({
      status: "success",
      message: "Device added successfully",
      status_code: 201,
    });

  } catch (error) {
    console.error("Device Addition Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      status_code: 500,
    });
  }finally {
    await client.close();
  }
});

router.get("/alldevices", async (req, res) => {
  try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(deviceCollection);

      const { status } = req.query;
      const query = status ? { status: { $regex: new RegExp(`^${status}$`, "i") } } : {}; 

      const devices = await collection.find(query).toArray();

      res.status(200).json({
          status: "success",
          message: "Devices retrieved successfully",
          total_devices: devices.length,
          devices,
          status_code: 200,
      });
  } catch (error) {
      console.error("Fetch Devices Error:", error);
      res.status(500).json({ error: "Internal server error" });
  } finally {
      await client.close();
  }
});

// router.post("/updatedevice", authenticateToken, async (req, res) => {
//   try {
//     const { deviceid, devicename, status, agentid, userid, image } = req.body;
//     const errors = [];
//     const supportid = req.user.supportid;
//     const validStatuses = ["available", "assigned", "delivered", "damaged"];

//     if (!deviceid) {
//       errors.push({ field: "deviceid", error: "Device ID is required" });
//     }

//     if (status && !validStatuses.includes(status)) {
//       errors.push({ field: "status", error: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
//     }

//     if (status !== "available" && (!supportid || !agentid || !userid)) {
//       errors.push({ field: "supportid/agentid/userid", error: "Required when status is not 'available'" });
//     }

//     if (image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(image)) {
//       errors.push({ field: "image", error: "Invalid image URL format" });
//     }

//     if (errors.length > 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid input",
//         description: "Invalid syntax for this request was provided",
//         errors: errors,
//         status_code: 400,
//       });
//     }

//     await client.connect();
//     const db = client.db(dbName);
//     const collection = db.collection(deviceCollection);

//     const existingDevice = await collection.findOne({ deviceid });
//     if (!existingDevice) {
//       return res.status(404).json({
//         status: "error",
//         message: "Device not found",
//         status_code: 404,
//       });
//     }

//     const updateData = {};
//     if (devicename) updateData.devicename = devicename;
//     if (status) updateData.status = status;
//     if (image) updateData.image = image;
//     if (status !== "available") {
//       updateData.supportid = supportid;
//       updateData.agentid = agentid;
//       updateData.userid = userid;
//     }

//     await collection.updateOne({ deviceid }, { $set: updateData });
//     const updatedDevice = await collection.findOne({ deviceid });

//     res.status(200).json({
//       status: "success",
//       message: "Device updated successfully",
//       updatedDevice,
//       status_code: 200,
//     });
//   } catch (error) {
//     console.error("Device Update Error:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       description: "Something went wrong on the server",
//       status_code: 500,
//     });
//   } finally {
//     await client.close();
//   }
// });

// router.get("/availabledevicescount", async (req, res) => {
//     try {  
//       await client.connect();
//       const db = client.db(dbName);
//       const collection = db.collection(deviceCollection);
  
//       const device = await collection.find({status:"available"}).toArray();
//       console.log(device);
//       const count = device.length
//       res.status(200).json({
//         status: "success",
//         message: "retrieved successfully",
//         data: count,
//         status_code: 200,
//       });
//     } catch (error) {
//       console.error("Fetch Support error:", error);
//       res.status(500).json({
//         status: "error",
//         message: "Internal server error",
//         description: "Something went wrong on the server",
//         status_code: 500,
//       });
//     }finally {
//       await client.close();
//     }
//   });


router.get('/get',(req,res)=>{
  res.send('send');
})

router.get("/:deviceid", async (req, res) => {
  try {
      const { deviceid } = req.params;
      // console.log(req.params)
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(deviceCollection);
      
      const device = await collection.findOne({ deviceid });
      // console.log(device)
      if (!device) {
      return res.status(404).json({
          status: "error",
          message: "Device not found",
          status_code: 404
      });
      }

      res.status(200).json({
      status: "success",
      message: "Device retrieved successfully",
      device,
      status_code: 200
      });
  } catch (error) {
      console.error("Fetch Device Error:", error);
      res.status(400).json({ error: "Internal server error" });
  } finally {
      await client.close();
  }
});

module.exports = router;



