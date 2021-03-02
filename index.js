const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 5000;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());


// for mongoDB
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.efdix.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  if (err) {
    console.log("Error detected -> ", err);
    return;
  }
  console.log("connected successfully");

  const productsCollection = client.db(process.env.DB_NAME).collection("products");
  const ordersCollection = client.db(process.env.DB_NAME).collection("orders");

  app.post('/addProduct', (req, res) => {
    const productList = req.body;

    productsCollection.insertMany(productList)
      .then(result => {
        console.log(result.insertedCount);
        res.status(200).send(result.insertedCount.toString());
      })
  });

  app.get('/products', (req, res) => {
    productsCollection.find({})
      .toArray((err, documents) => {
        res.status(200).send(documents);
      })
  });

  app.get('/product/:key', (req, res) => {
    productsCollection.find({ key: req.params.key })
      .toArray((err, document) => {
        res.status(200).send(document[0]);
      })
  });

  app.post('/productByKeys', (req, res) => {
    const productKeys = req.body;

    productsCollection.find({key: {$in: productKeys}})
    .toArray((err, documents) => {
      res.status(200).send(documents);
    })
  });

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then(result => {
      console.log(result.insertedCount > 0);
      res.status(200).send(result.insertedCount > 0);
    })
  });
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})