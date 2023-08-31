const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@cluster0.pg0dj0q.mongodb.net/?retryWrites=true&w=majority`;
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
     const flyCollection = client.db('flyFarazData').collection('flyData')


     app.get('/flyData', async(req, res) =>{
        const query = {}
        const cursor = flyCollection.find(query);
        const flyData = await cursor.toArray();
        res.send(flyData);
       });

       app.get('/flyData/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const booking = await  flyCollection.findOne(query);
        res.send(booking);
      });

  } finally {
    
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Start up server is running')
}) 

app.listen(port, ()=>{
    console.log(`Start Up server running on ${port}`)
})