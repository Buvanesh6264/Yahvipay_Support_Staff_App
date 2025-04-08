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
        const { pickupLocation, destination, agentid, devices, reciver, sender } = req.body;
        const supportid = req.user.supportid;
        const accessories = [];
        // console.log(req.body,'data')
        // console.log(req.user.id,'userid')
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
            status:"packed",
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
                            parcelNumber,
                            Inventory: false,
                        },
                    }
                )
            )
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

router.post("/Updateparcel", authenticatetoken, async (req, res) => {
  try {
      const { agentid, devices, accessories, parcelNumber } = req.body;
      const supportid = req.user.supportid;
      // console.log(req.body);

      if ((!devices || devices.length === 0) && (!accessories || accessories.length === 0)) {
          return res.status(400).json({
              status: "error",
              message: "At least one device or accessory is required",
              status_code: 400,
          });
      }

      await client.connect();
      const db = client.db(dbName);
      const Device = db.collection(devicesCollection);
      const Parcel = db.collection(parcelCollection);
      const Accessory = db.collection(accessoriesCollection);

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

      for (let { id, quantity } of accessories) {
          const accessory = await Accessory.findOne({ accessoriesid: id });

          if (!accessory || accessory.quantity < quantity) {
              return res.status(400).json({
                  status: "error",
                  message: `Accessory ${id} is out of stock or insufficient quantity`,
                  status_code: 400,
              });
          }
      }

      await Parcel.updateOne(
          { parcelNumber },
          {
              $set: { agentid, supportid },
              $push: { 
                  devices: { $each: devices || [] },
                  accessories: { $each: accessories || [] } 
              }
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
      if (accessories.length > 0) {
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

              let currentQuantity = parseInt(accessory.quantity, 10);
              let decrementQuantity = parseInt(quantity, 10);

              if (isNaN(currentQuantity) || isNaN(decrementQuantity) || currentQuantity < decrementQuantity) {
                  return res.status(400).json({
                      status: "error",
                      message: `Not enough stock for accessory ${id}`,
                      status_code: 400,
                  });
              }

              let newQuantity = currentQuantity - decrementQuantity;

              await Accessory.updateOne(
                { accessoriesid: id },
                { $set: { quantity: newQuantity.toString() } } 
            );            
          })
      );
    }

      const updatedParcel = await Parcel.findOne({ parcelNumber });
      // console.log("Updated Parcel:", updatedParcel);

      res.status(201).json({
          status: "success",
          message: "Parcel updated successfully",
          parcelNumber,
          status_code: 201,
      });
  } catch (error) {
      console.error("Parcel Update Error:", error);
      res.status(500).json({
          status: "error",
          message: "Internal server error",
          status_code: 500,
      });
  } finally {
    if (client) await client.close();
  }
});

router.get("/userparcels", authenticatetoken, async (req, res) => {
  try {
    const supportid = req.user.supportid;

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(parcelCollection);

    const parcels = await collection.find({supportid,status: { $ne: "delivered" }}).toArray();
    
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
    if (client) await client.close();
  }
});

router.get("/allparcels", async (req, res) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(parcelCollection);
  
  
      const parcels = await collection.find({ status: { $ne: "delivered" } }).toArray();``
  
      res.status(200).json({
        status: "success",
        message: "Parcels retrieved successfully",
        data: parcels,
        
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
      if (client) await client.close();
    }
});

// router.get("/parcelcount", async (req, res) => {
//     try {
//       // const supportid = req.user.supportid;
  
//       await client.connect();
//       const db = client.db(dbName);
//       const collection = db.collection(parcelCollection);
  
//       const parcels = await collection.find({}).toArray();
//       const count =parcels.length;
//       console.log(count)
//       res.status(200).json({
//         status: "success",
//         message: "Parcels count retrieved successfully",
//         data: count,
//         status_code: 200,
//       });
//     } catch (error) {
//       console.error("Fetch Support Parcels Error:", error);
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

router.post("/agentid", async (req, res) => {
  try {
    const { agentid } = req.body;
    // console.log(agentid)
    if (!agentid) {
      return res.status(400).json({
        status: "error",
        message: "Missing agentid",
        description: "Agent ID is required as a query parameter",
        status_code: 400,
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(parcelCollection);

    const parcels = await collection.find({ agentid, status: { $nin: ["delivered", "packed"] } }).toArray();

    if (parcels.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No parcels found",
        description: "No parcels found for the given agent ID",
        status_code: 404,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Parcels retrieved successfully",
      data: parcels,
      status_code: 200,
    });
  } catch (error) {
    console.error("Fetch Parcel Error:", error);
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

//agent filter parcel
router.post("/agentidstatus", async (req, res) => {
  try {
    const { agentid, status } = req.body;

    if (!agentid) {
      return res.status(400).json({
        status: "error",
        message: "Missing agentid",
        description: "Agent ID is required",
        status_code: 400,
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(parcelCollection);

    const query = { agentid };
    if (status && status !== "All") {
      query.status = status;
    }

    const parcels = await collection.find(query).toArray();

    if (parcels.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No parcels found",
        description: "No parcels found for the given criteria",
        status_code: 404,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Parcels retrieved successfully",
      data: parcels,
      status_code: 200,
    });
  } catch (error) {
    console.error("Fetch Parcel Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      status_code: 500,
    });
  } finally {
    await client.close();
  }
});

router.post("/parcelNumber", async (req, res) => {
    try {
        const { parcelNumber } = req.body;
        
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
        if (client) await client.close();
    }
});

router.post("/updatestatus", async (req, res) => {
  try {
    const { parcelNumber, status } = req.body;
    // console.log(req.body);
    
    if (!parcelNumber || !status) {
      return res.status(400).json({
        status: "error",
        message: "Both 'parcelNumber' and 'status' are required"
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(parcelCollection);
    const Device = db.collection(devicesCollection);
    if(status === "delivered"){
      const parcel = await collection.findOne({ parcelNumber });
      if (!parcel) {
          return res.status(400).json({
              status: "error",
              message: `Parcel ${parcelNumber} not found`,
              status_code: 400,
          });
      }
      const devices = parcel.devices || [];

      for (let deviceid of devices) {
          const device = await Device.findOne({ deviceid });
          if (!device) {
              return res.status(400).json({
                  status: "error",
                  message: `Device ${deviceid} not found`,
                  status_code: 400,
              });
          }
      }
      await Promise.all(
        devices.map(deviceid =>
            Device.updateOne(
                { deviceid },
                {
                    $set: {
                        status: "delivered",
                    },
                }
            )
        )
      );
    }
    const result = await collection.updateOne(
      { parcelNumber: parcelNumber },
      {
        $set: {
          status: status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Parcel not found"
      });
    }
    res.json({
      status: "success",
      message: "Parcel status updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server error",
      error: error.message
    });
  } finally {
    if (client) await client.close();
  }
});


module.exports = router;
