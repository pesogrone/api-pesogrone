const express = require("express"); // express makes APIs - connect frotend to database
const Redis = require("redis"); //redis is a database, import the Redis class from the redis library
const bodyParser = require("body-parser"); //body-parser is a library that allows us to read the body of a request
const cors = require("cors"); //cors is a library that allows us to make requests from the frontend to the backend

const options = {
  origin: "http://localhost:3000", //allow requests from the frontend
};
//import redis from 'redis';//import redis library

const redisClient = Redis.createClient({
  url: `redis://localhost:6379`, //connect to redis on port 6379
}); //create a redis client
const app = express(); // create an express application
app.use(bodyParser.json()); //use the body-parser library to read JSON from the request body
app.use(cors(options)); //use the cors library to allow requests from the frontend
const port = 3001; // port to run the server on
app.listen(port, () => {
  redisClient.connect(); //connect to redis
  console.log(`API is listening on port: ${port}`); //template literal
}); //listen for web requests form the frontend and don't stop () => console.log('listening at 3000')); // listen for requests on port 3000

app.get("/boxes", async (req, res) => {
  let boxes = await redisClient.json.get("boxes", { path: "$" }); //get boxes from redis
  res.json(boxes[0]); //convert boxes to a JSON string and send it to the user
}); //return boxes to the user

app.post("/boxes", async (req, res) => {
  const newBox = req.body; //get the box from the request body
  newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1; //add an id to the box, the user should not provide an id
  await redisClient.json.arrAppend("boxes", "$", newBox); //save the box to redis
  res.json(newBox); //send the box back to the user
}); //add a box to the list of boxes
app.post("/boxes", async (req, res) => {
  const newBox = req.body; //get the box from the request body
  newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1; //add an id to the box, the user should not provide an id
  await redisClient.json.arrAppend("boxes", "$", newBox); //save the box to redis
  res.json(newBox); //send the box back to the user
}); //add a box to the list of boxes

const orderSchema = {
  type: "object",
  properties: {
    customerName: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          productId: { type: "number" },
          quantity: { type: "number" },
        },
        required: ["productId", "quantity"],
      },
    },
  },
  required: ["customerName", "items"],
};

const Ajv = require("ajv");
const ajv = new Ajv();

app.post("/orders", async (req, res) => {
  const validate = ajv.compile(orderSchema);
  const valid = validate(req.body);

  if (!valid) {
    res.status(400).json(validate.errors);
  } else {
    const newOrder = req.body;
    // Check if the 'orders' key exists
    const ordersExist = await redisClient.exists("orders");
    if (ordersExist.arrLen == null) {
      // If it doesn't exist, set the id to 1
      newOrder.id = 1;
    } else {
      // If it does exist, set the id to the length of the array + 1
      newOrder.id = parseInt(await redisClient.json.arrLen("orders", "$")) + 1;
    }
    await redisClient.json.arrAppend("orders", "$", newOrder);
    res.json(newOrder);
  }
});

app.get("/orders", async (req, res) => {
  let orders = await redisClient.json.get("orders", { path: "$" });
  res.json(orders[0]);
});
//make a list of boxes
// const boxes = [
//   { name: "Box1", boxid: 1 },
//   { name: "Box2", boxid: 2 },
//   { name: "Box3", boxid: 3 },
//   { name: "Box4", boxid: 4 },
// ]; //hardcoded boxes-not in the database.
//1-URL
//2-Callback function
//3-Response
//req=request
//res=response
