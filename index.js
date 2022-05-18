const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const corsConfig = {
  origin: true,
  credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qiwh1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const todoCollection = client.db("todo").collection("todoList");

app.get("/", (req, res) => {
  res.send({ message: "Server connected" });
});

const run = async () => {
  await client.connect();

  //   get task
  app.get("/getTask", async (req, res) => {
    const email = req.query.email;
    const query = { user: email };
    const task = await todoCollection.find(query).toArray();

    res.send(task);
  });

  //   update task
  app.put("/complete", async (req, res) => {
    const id = req.query.id;
    const task = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        completed: task?.completed,
      },
    };

    const result = await todoCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
  });

  //   create task
  app.post("/addtask", async (req, res) => {
    const todo = req.body;
    const result = await todoCollection.insertOne(todo);
    res.send(result);
  });

  // delete task
  app.delete("/delete", async (req, res) => {
    const id = req.query.id;
    const query = { _id: ObjectId(id) };
    const result = await todoCollection.deleteOne(query);
    res.send(result);
  });
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running :D");
});
