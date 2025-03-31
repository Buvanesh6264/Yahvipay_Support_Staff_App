const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const parcelCollection = process.env.PARCEL_COLLECTION;
const accessoriesCollection = process.env.ACCESSORIES_COLLECTION;
const devicesCollection = process.env.DEVICE_COLLECTION;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new MongoClient(uri);

const generateParcelNumber = () => {
    const timestamp = Date.now().toString().slice(-6); 
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `PCL${timestamp}${randomSuffix}`; 
};




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

router.post("/addparcel", authenticatetoken, async (req, res) => {
    try {
        const { pickupLocation, destination, agentid, devices, accessories, reciver, sender } = req.body;
        const supportid = req.user.supportid;
        console.log(req.body,'data')
        console.log(req.user.id,'userid')
        if (!pickupLocation) {
          return res.status(400).json({
            status: "error",
            message: "Pickup location is required",
            status_code: 400,
          });
        }
        
        if (!destination) {
          return res.status(400).json({
            status: "error",
            message: "Destination is required",
            status_code: 400,
          });
        }
        
        if (!devices || devices.length === 0) {
          return res.status(400).json({
            status: "error",
            message: "At least one device ID is required",
            status_code: 400,
          });
        }
        

        await client.connect();
        const db = client.db(dbName);
        const Device = db.collection(devicesCollection);
        const Accessory = db.collection(accessoriesCollection);
        const Parcel = db.collection(parcelCollection);

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

        for (let { id, quantity } of accessories) {
          console.log(typeof quantity,'quantity')
          console.log(id,quantity,'acdata')
            const accessory = await Accessory.findOne({ accessoriesid: id });
            console.log(accessory,'acces data')
            if (!accessory || accessory.quantity < quantity) {
                return res.status(400).json({
                    status: "error",
                    message: `Accessory ${id} is out of stock or insufficient quantity`,
                    status_code: 400,
                });
            }
        }

        const parcelNumber = generateParcelNumber();

        await Parcel.insertOne({
            parcelNumber,
            pickupLocation,
            destination,
            agentid,
            supportid,
            devices,
            accessories,
            reciver,
            sender,
            createdAt: new Date(),
        });

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

        await Promise.all(
          accessories.map(async ({ id, quantity }) => {
              const accessory = await Accessory.findOne({ accessoriesid: id });
      
              if (!accessory) {
                  return res.status(400).json({
                      status: "error",
                      message: `Accessory ${id} not found`,
                      status_code: 400,
                  });
              }
      
              let currentQuantity = parseInt(accessory.quantity); 
              let decrementQuantity = parseInt(quantity); 
      
              if (isNaN(currentQuantity) || isNaN(decrementQuantity)) {
                  return res.status(400).json({
                      status: "error",
                      message: `Invalid quantity for accessory ${id}`,
                      status_code: 400,
                  });
              }
      
              if (currentQuantity < decrementQuantity) {
                  return res.status(400).json({
                      status: "error",
                      message: `Not enough stock for accessory ${id}`,
                      status_code: 400,
                  });
              }
      
              let newQuantity = (currentQuantity - decrementQuantity).toString(); 
      
              await Accessory.updateOne(
                  { accessoriesid: id },
                  { $set: { quantity: newQuantity } } 
              );
          })
      );
      

        res.status(201).json({
            status: "success",
            message: "Parcel added successfully",
            parcelNumber,
            status_code: 201,
        });
    } catch (error) {
        console.error("Parcel Addition Error:", error);
        console.error(error.stack);
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
