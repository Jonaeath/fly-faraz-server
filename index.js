const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      res.status(401).send({message:'Unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
      if(error){
        res.status(401).send({message:'Unauthorized access'})
      }
      req.decoded = decoded;
      next()
    })
}

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
     const bookingCollection = client.db('flyFarazData').collection('bookingData');
     
     app.post('/jwt',(req,res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res.send({token});
     })

     app.get('/flyData', async(req, res) =>{
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const query = {}
        const cursor = flyCollection.find(query);
        const flyData = await cursor.skip(page*size).limit(size).toArray();
        const count = await flyCollection.estimatedDocumentCount(); //For Pagination
        res.send({count, flyData});
       });

       app.get('/flyData/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const booking = await flyCollection.findOne(query);
        res.send(booking);
      });

      
  // api order

app.post('/bookingData', async(req,res) =>{
    const booking = req.body;
    const result = await bookingCollection.insertOne(booking);
    res.send(result); 
   });

   app.get('/bookingData', verifyJWT, async(req,res)=>{
    const decoded = req.decoded;
    if(decoded.email !== req.query.email){
      res.status(403).send({message:'Unauthorized access'})
    }

    let query = {};
    if(req.query.email){
      query= {
        email: req.query.email
      }
    }
    const cursor = bookingCollection.find(query);
    const orders = await cursor.toArray();
    res.send(orders)
   })

   app.patch('/bookingData/:id', async(req, res)=> {
    const id = req.params.id;
    const status = req.body.status;
    const query = {_id: new ObjectId(id)};
    updatedDoc = {
      $set:{
        status: status
      }
    }
    const result = await bookingCollection.updateOne(query, updatedDoc)
   })

   app.delete('/bookingData/:id', async(req, res)=> {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await bookingCollection.deleteOne(query);
    res.send(result);
  })

  } finally {
    
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Fly Faraz server is running')
}) 

app.listen(port, ()=>{
    console.log(`Fly Farza server running on ${port}`)
})