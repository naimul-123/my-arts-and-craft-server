const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const port = process.env.PORT
const username = process.env.DB_USER
const password = process.env.DB_PASSWORD
const app = express();
app.use(cors())
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Server is running ok')
})
// console.log(username, password)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${username}:${password}@cluster0.nevhe4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("craftDB");
        const craftCollection = database.collection("craftItems");
        const subCatagoryCollection = database.collection("subcatagories")
        const curoselCollection = database.collection("sliderdata")
        const testimonialCollection = database.collection("testimonials")


        app.get('/curosel', async (req, res) => {
            const cursor = curoselCollection.find();
            const curosel = await cursor.toArray()
            res.send(curosel)
        })
        app.get('/testimonials', async (req, res) => {
            const cursor = testimonialCollection.find();
            const testimonials = await cursor.toArray();
            res.send(testimonials)
        })



        app.get('/crafts', async (req, res) => {
            const cursor = craftCollection.find();
            const crafts = await cursor.toArray()
            res.send(crafts)
        })
        app.get('/crafts/latest', async (req, res) => {
            const cursor = craftCollection.find().sort({ _id: -1 }).limit(6);
            const crafts = await cursor.toArray()
            res.send(crafts)
        })
        app.get('/crafts/toprated', async (req, res) => {
            const cursor = craftCollection.find().sort({ rating: -1 }).limit(3);
            const crafts = await cursor.toArray()
            res.send(crafts)
        })

        app.get('/crafts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const craft = await craftCollection.findOne(query);
            res.send(craft)
        })
        app.get('/subcatagories', async (req, res) => {
            const cursor = subCatagoryCollection.find();
            const subCatagoryCrafts = await cursor.toArray();
            res.send(subCatagoryCrafts);
        })
        app.get('/catagories/:id', async (req, res) => {

            const subCatagory = req.params.id;
            const query = { sub_catagory: subCatagory }
            const subCatagoryCrafts = await craftCollection.find(query).toArray();
            // console.log(subCatagory)
            res.send(subCatagoryCrafts)
        })

        app.post('/mycrafts', async (req, res) => {
            const userEmail = req.body.email;
            const customization = req.body.customization;
            let query = { email: userEmail }
            if (customization) {
                query.customization = customization
            }
            const mycrafts = await craftCollection.find(query).toArray();
            res.send(mycrafts);
        })
        app.post('/crafts', async (req, res) => {
            const craft = req.body;
            const result = await craftCollection.insertOne(craft);
            res.send(result)
        })

        app.put("/crafts", async (req, res) => {
            const data = req.body;
            const id = data.id;
            const craft = data.updatedCraft;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCraft = {
                $set: {
                    item_name: craft.item_name,
                    image: craft.image,
                    sub_catagory: craft.sub_catagory,
                    description: craft.description,
                    processing_time: craft.processing_time,
                    customization: craft.customization,
                    price: craft.price,
                    rating: craft.rating,
                    stock_status: craft.stock_status,
                }
            }
            const result = await craftCollection.updateOne(filter, updatedCraft, options);
            res.send(result)
        })



        app.delete('/mycrafts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await craftCollection.deleteOne(query)
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
})



