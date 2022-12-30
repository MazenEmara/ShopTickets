const Db = process.env.ATLAS_URI;
const express = require("express");
const app = express();
const cors = require("cors");
var bodyParser = require('body-parser')
const axios = require('axios');
const { uuid } = require('uuidv4');
require("dotenv").config({ path: "../config.env" }); 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
const {mongoClient} = require("../conn");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
// This will help us connect to the database
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/master',async function (req, response) {
  let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');

  var myobj =req.body
     myobj=myobj.map(obj=>({
          matchNumber: obj.matchNumber,
          roundNumber: obj.roundNumber,
          dateUtc: obj.dateUtc,
          location: obj.location,
          availability: {
              category1: {
                  count: obj.availability.category1.available,
                  price: obj.availability.category1.price,
                  Pending:0
              },
              category2: {
                  count: obj.availability.category2.available,
                  price: obj.availability.category2.price,
                  Pending:0
              },
              category3: {
                  count: obj.availability.category3.available,
                  price: obj.availability.category3.price,
                  Pending:0
              }, 
          },
          homeTeam: obj.homeTeam,
          awayTeam: obj.awayTeam,
          group:obj.group,
      }));
  db_connect.collection("ShopMicroservice").insertMany(myobj, function (err, res) {
  if (err) throw err;
      response.json(res);
  });

  

});
app.post('/api/add',async function (req, response) {
    let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');
  var obj =req.body
  let myobj={
          matchNumber: obj.matchNumber,
          roundNumber: obj.roundNumber,
          dateUtc: obj.dateUtc,
          location: obj.location,
          availability: {
              category1: {
                  count: obj.availability.category1.available,
                  price: obj.availability.category1.price,
                  Pending:0
              },
              category2: {
                  count: obj.availability.category2.available,
                  price: obj.availability.category2.price,
                  Pending:0
              },
              category3: {
                  count: obj.availability.category3.available,
                  price: obj.availability.category3.price,
                  Pending:0
              }, 
          },
          homeTeam: obj.homeTeam,
          awayTeam: obj.awayTeam,
          group:obj.group,
      };
  db_connect.collection("ShopMicroservice").insertOne(myobj, function (err, res) {
  if (err) throw err;
      response.json(res);
  });

  

});
app.get('/api/:matchNumber',async function (req, res) {
    let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');
  let myquery = { matchNumber: Number(req.params.matchNumber)};
  db_connect
  .collection("ShopMicroservice")
  .findOne(myquery, function (err, result) {
      if (err) throw err;
      res.json(result);
  });
});

app.get('/api',async function (req, res) {
    let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');
  db_connect
  .collection("ShopMicroservice")
  .find({})
  .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
  });
});
app.post('/api/cancel/:matchNumber',async function (req, response) {
    let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');
  let myquery = { matchNumber: Number(req.params.matchNumber)};
  let newvalues;
  if(Number(req.body.availability.category) ===1){
      newvalues = {
          "$inc" : { 
              "availability.category1.Pending" : -req.body.availability.quantity,
          }
      };
  }
  else if(Number(req.body.availability.category) ===2){
      newvalues = {
          "$inc" : { 
              "availability.category2.Pending" : -req.body.availability.quantity,
          }
      };
  }
  else{
      newvalues = {
          "$inc" : { 
              "availability.category3.Pending" : -req.body.availability.quantity,
          }
      };
  }
  db_connect
  .collection("ShopMicroservice")
  .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("Quantity updated");
      response.json(res);
  });
});

app.post('/api/pending/:matchNumber',async function (req, response) {
    let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');
  let myquery = { matchNumber: Number(req.params.matchNumber)};
  let newvalues;
  if(Number(req.body.availability.category) ===1){
      newvalues = {
          "$inc" : { 
              "availability.category1.Pending" : req.body.availability.quantity,
          }
      };
  }
  else if(Number(req.body.availability.category) ===2){
      newvalues = {
          "$inc" : { 
              "availability.category2.Pending" : req.body.availability.quantity,
          }
      };
  }
  else{
      newvalues = {
          "$inc" : { 
              "availability.category3.Pending" : req.body.availability.quantity,
          }
      };
  }
  db_connect
  .collection("ShopMicroservice")
  .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("Quantity updated");
      response.json(res);
  });
});
app.post('/api/reserved/:matchNumber',async function (req, response) {
    let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');
  let myquery = { matchNumber: Number(req.params.matchNumber)};
  let newvalues;
  if(Number(req.body.availability.category) ===1){
      newvalues = {
          "$inc" : { 
              "availability.category1.Pending" : -req.body.availability.quantity,
              "availability.category1.count" : -req.body.availability.quantity
          }
      };
  }
  else if(Number(req.body.availability.category) ===2){
      newvalues = {
          "$inc" : { 
              "availability.category2.Pending" : -req.body.availability.quantity,
              "availability.category2.count" : -req.body.availability.quantity
          }
      };
  }
  else{
      newvalues = {
          "$inc" : { 
              "availability.category3.Pending" : -req.body.availability.quantity,
              "availability.category3.count" : -req.body.availability.quantity
          }
      };
  }
  db_connect
  .collection("ShopMicroservice")
  .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("Quantity updated");
      response.json(res);
  });
});
app.delete('/api/:matchNumber',async function (req, response){
    let db_connect = await mongoClient();
  if (!db_connect) res.status(500).send('Systems Unavailable');
  let myquery = { matchNumber: Number(req.params.matchNumber)};
  db_connect.collection("ShopMicroservice").deleteOne(myquery, function (err, obj) {
  if (err) throw err;
  console.log("List deleted");
  response.json(obj);
  });
});


app.listen(3000);
