const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT
const username = process.env.DB_USER
const password = process.env.DB_PASSWORD
const app = express();
app.use(cors())
app.use(express.json());


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


        app.get('/crafts', async (req, res) => {
            const cursor = craftCollection.find();
            const crafts = await cursor.toArray()
            res.send(crafts)
        })
        app.get('/crafts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const craft = await craftCollection.findOne(query);
            res.send(craft)
        })

        app.post('/mycrafts', async (req, res) => {
            const userEmail = req.body.email;
            const query = { email: userEmail }
            const mycrafts = await craftCollection.find(query).toArray();
            res.send(mycrafts);
        })
        app.post('/crafts', async (req, res) => {
            const craft = req.body;
            console.log(craft)
            const result = await craftCollection.insertOne(craft);
            res.send(result)
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


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running ok')
})

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
})



