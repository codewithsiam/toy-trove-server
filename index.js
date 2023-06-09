const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// const uri = "mongodb://0.0.0.0:27017";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qgjgqwg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // my codes here
    const toysCollection = client.db("toyTrove").collection("allToys");

    const indexKey = { toyName: 1 };
    const indexOptions = { name: 'nameSearch' };
    
    // const result =  await toysCollection.createIndex(indexKey, indexOptions);
   

    // operations
    app.get("/allToys", async (req, res) => {
      let query = {};
      
      // search 
      if (req.query?.toyName) {
        query = { toyName: { $regex: req.query?.toyName, $options: "i" } };
      }

      // limit
      const limit = parseInt(req.query.limit);
      const cursor = toysCollection.find(query).limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });

     // filter by category

     app.get("/allToys/:category", async (req, res) => {
      const subCategory = req.params.category;
      const cursor = toysCollection.find({ subCategory: subCategory });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // here option can be added
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

   
    // add toy
    app.post("/addToy", async (req, res) => {
      const toyData = req.body;
      const result = await toysCollection.insertOne(toyData);
      res.send(result);
    });

    // my toys
    app.get("/myToys", async (req, res) => {
      let query = {};
      let sortOrder = {}
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
    if(req.query?.sortOrder){
       if(req.query.sortOrder == "ascending"){
          sortOrder = { price: 1 } 
       } 
        if(req.query.sortOrder == "descending"){
          sortOrder = { price: -1 } 
       } 
    }
      
      const result = await toysCollection.find(query).sort(sortOrder).collation({ locale: "en_US", numericOrdering: true }).toArray();
    
      res.send(result);
    });
    

    // update a existing toy
    app.patch("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const toyData = req.body;
      const updatedToy = {
        $set: {
          price: toyData.price,
          availableQuantity: toyData.availableQuantity,
          toyDetails: toyData.toyDetails,
        },
      };
      const result = await toysCollection.updateOne(filter, updatedToy);
      res.send(result);
    });

    // delete toy

    app.delete("/myToyList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy server is running...");
});

app.listen(port, () => {
  console.log(`Toy server is running on port: ${port}`);
});
