const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");


const router = express.Router();
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const ticketsCollection = process.env.TICKETS_COLLECTION;
const accessoriesCollection = process.env.ACCESSORIES_COLLECTION;
// const trackingCollection = process.env.TRACKING_COLLECTION;
const client = new MongoClient(uri);
const JWT_SECRET = process.env.JWT_SECRET;


const authenticatetoken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader){
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
      description: "No token provided",
      status_code: 401,
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
      description: "Token format is invalid",
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


router.post("/requestParcel", async (req, res) => {
  // console.log("hi");
    try {
      const { Type, accessories, devices, agent_id, status } = req.body.requestItem;
      // console.log(req.body)
      // console.log("ty",Type)
      // console.log("acc",accessories)
      // console.log("dev",devices)
      // console.log("agent",agent_id)
      if (!Type || Type !== "Parcel Request") {
        return res.status(400).json({
          status: "error",
          message: "Invalid Type. Must be 'Parcel Request'",
          status_code: 400,
        });
      }
  
      if (!agent_id) {
        return res.status(400).json({
          status: "error",
          message: "Agent ID is required",
          status_code: 400,
        });
      }
  
      if (!devices || isNaN(devices)) {
        return res.status(400).json({
          status: "error",
          message: "Devices count must be a valid number",
          status_code: 400,
        });
      }
  
      if (!accessories || accessories.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "At least one accessory is required",
          status_code: 400,
        });
      }
  
      await client.connect();
      const db = client.db(dbName);
      const tickets = db.collection(ticketsCollection);
      const Accessory = db.collection(accessoriesCollection);
  
      for (let item of accessories) {
        const found = await Accessory.findOne({ accessoriesid: item.accessoriesid });
        if (!found) {
          return res.status(400).json({
            status: "error",
            message: `Accessory ${item.accessoriesid} not found`,
            status_code: 400,
          });
        }
      }
  
      
      const ticketNumber = `PR-${Date.now()}`;
  
      await tickets.insertOne({
        ticketNumber,
        type: Type,
        agentid: agent_id,
        devices: parseInt(devices),
        accessories,
        status,
        supportid:"",
        createdAt: new Date(),
      });
  
      res.status(200).json({
        status: "success",
        message: "Parcel request created successfully",
        ticketNumber,
        status_code: 200,
      });
    } catch (error) {
      console.error("Request Parcel Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        status_code: 500,
      });
    } finally {
      if (client) await client.close();
    }
});

router.get("/all",async (req,res)=>{
    try {
        await client.connect();
        const db = client.db(dbName);
        const tickets = db.collection(ticketsCollection);
  
        const allTickets = await tickets.find({status: { $ne: "Asigned" }}).toArray();
  
        if (allTickets.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "No tickets found",
            status_code: 404,
          });
        }
  
        res.status(200).json({
          status: "success",
          message: "Tickets retrieved successfully",
          data: allTickets,
          status_code: 200,
        });
      } catch (error) {
        console.error("Fetch All Tickets Error:", error);
        res.status(500).json({
          status: "error",
          message: "Internal server error",
          description: "Something went wrong on the server",
          status_code: 500,
        });
      } finally {
        if (client) await client.close();
      }
})
  
router.post("/TicketNumber", async (req, res) => {
    try {
        const { ticketNumber } = req.body;
        
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(ticketsCollection);

        const parcel = await collection.findOne({ ticketNumber });

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

router.get("/userparcels", authenticatetoken, async (req, res) => {
  try {
    const supportid = req.user.supportid;
    // console.log("sup",supportid)
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(ticketsCollection);
    
    const parcels = await collection.find( {supportid} ).toArray();

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
  } finally {
    if (client) await client.close();
  }
});

router.post("/updatestatus", authenticatetoken , async (req, res) => {
  try {
    const supportid = req.user.supportid;
    const { ticketNumber, status } = req.body;
    // console.log(req.body)
    // console.log("supid",supportid)
    if (!ticketNumber || !status) {
      return res.status(400).json({
        status: "error",
        message: "Both 'ticketNumber' and 'status' are required",
      });
    }

    // if (status !== "Asigned") {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Only 'Asigned' status update is allowed",
    //   });
    // }

    await client.connect();
    const db = client.db(dbName);
    const Device = db.collection(ticketsCollection);

    const Ticket = await Device.findOne({ ticketNumber });
    if (!Ticket) {
      return res.status(404).json({
        status: "error",
        message: `Device with ID ${ticketNumber} not found`,
        status_code: 404,
      });
    }
    if(Ticket.status === "Asigned") {
      return res.status(400).json({
        status: "error",
        message: `Ticket with ID ${ticketNumber} is already Asigned`,
        status_code: 400,
      });
    }
    await Device.updateOne(
      { ticketNumber },
      { $set: { status: "Asigned", supportid }}
    );

    res.json({
      status: "success",
      message: "Ticket status updated to 'Asigned' successfully",
      status_code: 200,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (client) await client.close();
  }
});

module.exports = router;
