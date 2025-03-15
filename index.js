const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// mongoDB Local Credential
const uri = `mongodb://localhost:27017`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function main() {
    try {
        const db = client.db('Todo');
        console.log("Successfully connected to MongoDB!");

        // Define a database and collection
        const taskCollection = db.collection('tasks');

        // app.get('/tasks', async (req, res) => {
        //   const cursor = taskCollection.find({});
        //   const tasks = await cursor.toArray();
        //   res.send({ status: true, data: tasks });
        // });

        app.get('/tasks', async (req, res) => {
            let query = {};
            if (req.query.priority) {
                query.priority = req.query.priority;
            }
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send({ status: true, data: tasks });
        });

        app.post('/task', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        app.get('/task/:id', async (req, res) => {
            const id = req.params.id;
            const result = await taskCollection.findOne({ _id: ObjectId(id) });
            // console.log(result);
            res.send(result);
        });

        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const result = await taskCollection.deleteOne({ _id: ObjectId(id) });
            // console.log(result);
            res.send(result);
        });

        // status update
        app.put('/task/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const task = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    isCompleted: task.isCompleted,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                },
            };
            const options = { upsert: true };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Express server
        app.get('/', (req, res) => {
            res.send(`Server is running at ${new Date().toLocaleTimeString()}!`);
        });
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        });
    } catch (error) {
        console.error("Failed to run server!", error);
    }
}

main();

