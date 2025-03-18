require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.02sbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});


let taskCollection;

async function connectDB() {
    try {
        await client.connect();
        const db = client.db('Todo');
        taskCollection = db.collection('tasks');
        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
}

connectDB();

// Routes
app.get('/', (req, res) => {
    res.send({ status: true, message: `Server running at ${new Date().toLocaleTimeString()}` });
});

app.get('/tasks', async (req, res) => {
    try {
        const query = req.query.priority ? { priority: req.query.priority } : {};
        const tasks = await taskCollection.find(query).toArray();
        res.send({ status: true, data: tasks });
    } catch (error) {
        res.status(500).send({ status: false, message: "Error fetching tasks", error });
    }
});

app.post('/task', async (req, res) => {
    try {
        const task = req.body;
        if (!task.title || !task.description) {
            return res.status(400).send({ status: false, message: "Missing required fields" });
        }
        const result = await taskCollection.insertOne(task);
        res.send({ status: true, data: result });
    } catch (error) {
        res.status(500).send({ status: false, message: "Error adding task", error });
    }
});

app.get('/task/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const task = await taskCollection.findOne({ _id: new ObjectId(id) });
        if (!task) {
            return res.status(404).send({ status: false, message: "Task not found" });
        }
        res.send({ status: true, data: task });
    } catch (error) {
        res.status(500).send({ status: false, message: "Error fetching task", error });
    }
});

app.delete('/task/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: false, message: "Task not found" });
        }
        res.send({ status: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).send({ status: false, message: "Error deleting task", error });
    }
});



app.put('/task/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // console.log(id);
        const task = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: { ...task } };
        const options = { upsert: false };

        const result = await taskCollection.updateOne(filter, updateDoc, options);
        if (result.matchedCount === 0) {
            return res.status(404).send({ status: false, message: "Task not found" });
        }
        res.send({ status: true, message: "Task updated successfully", data: result });
    } catch (error) {
        res.status(500).send({ status: false, message: "Error updating task", error });
    }
});



// app.listen(port, () => {
//     console.log(`🚀 Server is running on port ${port}`);
// });
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
