const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();


const router = express.Router();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const accessoriesCollection = process.env.ACCESSORIES_COLLECTION;
const client = new MongoClient(uri);

router.get("/allaccessory", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(accessoriesCollection);

        const accessories = await collection.find({status:{$nin:["damaged"]}}).toArray();

        res.status(200).json({
            status: "success",
            message: "Accessories retrieved successfully",
            data: accessories,
            status_code: 200,
        });

    } catch (error) {
        console.error("Fetch Accessories Error:", error);
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

router.post("/accessoriesid", async (req, res) => {
    try {
        const { accessoriesid } = req.body;
        // console.log(accessoriesid)
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(accessoriesCollection);

        const accessory = await collection.findOne({ accessoriesid ,status:{$nin:["damaged"]}});

        if (!accessory) {
            return res.status(404).json({
                status: "error",
                message: "Accessory not found",
                description: "No accessory found with the given ID",
                status_code: 404,
            });
        }

        res.status(200).json({
            status: "success",
            message: "Accessory retrieved successfully",
            data: accessory,
            status_code: 200,
        });

    } catch (error) {
        console.error("Fetch Accessory Error:", error);
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


module.exports = router;