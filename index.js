const Redis = require("redis");
const { addOrder, getOrder } = require("./services/orderservice.js");
const { addOrderItem } = require("./services/orderItems.js");
const fs = require("fs");
const Schema = JSON.parse(fs.readFileSync("./orderItemSchema.json"));
const Ajv = require("ajv");
const ajv = new Ajv();
let redisClient;
const connectRedisClient = () => {
  if (!redisClient) {
    redisClient = Redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:6379}`,
    });
  }
};
exports.boxesHandler = async (event, context) => {
  connectRedisClient();
  try {
    const boxes = await redisClient.json.get("boxes", { path: "$" });
    return {
      statusCode: 200,
      body: JSON.stringify(boxes[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

exports.ordersHandler = async (event, context) => {
  connectRedisClient();

  try {
    if (
      event.httpMethod === "GET" &&
      event.pathParameters.orderId === "showallorders"
    ) {
      const allOrders = await showAllOrders(redisClient);
      return {
        statusCode: 200,
        body: JSON.stringify(allOrders),
      };
    } else if (event.httpMethod === "POST") {
      try {
        const order = event.body;
        let responseStatus =
          order.productQuantity !== null && order.shippingAddress !== null
            ? 200
            : 400;

        if (responseStatus === 200) {
          try {
            console.log("it runs");
            console.log(responseStatus);
            console.log(order);
            await addOrder({ redisClient, order });
            return {
              statusCode: 201,
              body: "Order added successfully",
            };
          } catch (error) {
            console.error(error);
            return {
              statusCode: 500,
              body: "Internal Server Error",
            };
          }
        }
      } catch (error) {
        console.error(error);
        return {
          statusCode: 400,
          body: "Invalid request body",
        };
      }
    }
    // } else {
    //     return {
    //         statusCode: 200,
    //         body: JSON.stringify({ message: "Hello from ordersHandler", event })
    //     };
    // }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

// exports.ordersHandler = async (event, context) => {

//     // return {
//     //     statusCode: 200,
//     //     body: JSON.stringify({ message: "Hello from ordersHandler", event })
//     // };

//     redisClient.connect().catch(console.error);
//     try {
//         const order = event.body;
//         let responseStatus =
//         order.productQuantity && order.shippingAddress ? 200 : 400;

//         if (responseStatus === 200) {
//             try {
//                 console.log("it runs");
//                 await addOrder({ redisClient, order });
//             } catch (error) {
//                 console.error(error);
//                 return {
//                     statusCode: 500,
//                     body: "Internal Server Error"
//                 };
//             }
//         }
//     //         return {
//     //     statusCode: 200,
//     //     body: JSON.stringify({ message: "Hello from ordersHandler", event })
//     // };

//         // return {
//         //     statusCode: responseStatus,
//         //     body: responseStatus === 200 ? "" : `Missing one of the following fields: ${exactMatchOrderFields()} ${partiallyMatchOrderFields()}`
//         // };
//     } catch (error) {
//         console.error(error);
//         return {
//             statusCode: 400,
//             body: "Invalid request body"
//         };
//     }
// };

exports.orderItemsHandler = async (event, context) => {
  connectRedisClient();
  try {
    const validate = ajv.compile(Schema);
    const valid = event.body;
    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    const orderItemId = await addOrderItem({
      redisClient,
      orderItem: JSON.parse(event.body),
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        orderItemId,
        message: "Order item added successfully",
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

exports.ordersByIdHandler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from ordersHandler", event }),
  };
  connectRedisClient();
  try {
    const orderId = event.pathParameters.orderId;
    const order = await getOrder({ redisClient, orderId });

    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

async function showAllOrders(redisClient) {
  // Assuming orders are stored with a hash-like structure in Redis:
  // Example: 'order:12345' -> { orderId: '12345', date: '2023-12-20', total: 99.99, ... }

  try {
    // 1. Get keys of all orders (consider using SCAN for large datasets)
    const orderKeys = await redisClient.keys("order:*");

    // 2. Fetch order data
    const orders = await Promise.all(
      orderKeys.map((key) => redisClient.hGetAll(key))
    );

    // 3. Return the array of orders
    return orders;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw to allow for appropriate error handling upstream
  }
}
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
//app.get("/boxes", async (req, res) => {
//   let boxes = await redisClient.json.get("boxes", { path: "$" }); //get boxes from redis
//   res.json(boxes[0]); //convert boxes to a JSON string and send it to the user
// }); //return boxes to the user

// app.post("/boxes", async (req, res) => {
//   const newBox = req.body; //get the box from the request body
//   newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1; //add an id to the box, the user should not provide an id
//   await redisClient.json.arrAppend("boxes", "$", newBox); //save the box to redis
//   res.json(newBox); //send the box back to the user
// }); //add a box to the list of boxes
// app.post("/boxes", async (req, res) => {
//   const newBox = req.body; //get the box from the request body
//   newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1; //add an id to the box, the user should not provide an id
//   await redisClient.json.arrAppend("boxes", "$", newBox); //save the box to redis
//   res.json(newBox); //send the box back to the user
// }); //add a box to the list of boxes
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
//app.get("/boxes", async (req, res) => {
//   let boxes = await redisClient.json.get("boxes", { path: "$" }); //get boxes from redis
//   res.json(boxes[0]); //convert boxes to a JSON string and send it to the user
// }); //return boxes to the user

// app.post("/boxes", async (req, res) => {
//   const newBox = req.body; //get the box from the request body
//   newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1; //add an id to the box, the user should not provide an id
//   await redisClient.json.arrAppend("boxes", "$", newBox); //save the box to redis
//   res.json(newBox); //send the box back to the user
// }); //add a box to the list of boxes
// app.post("/boxes", async (req, res) => {
//   const newBox = req.body; //get the box from the request body
//   newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1; //add an id to the box, the user should not provide an id
//   await redisClient.json.arrAppend("boxes", "$", newBox); //save the box to redis
//   res.json(newBox); //send the box back to the user
// }); //add a box to the list of boxes
//
///
//
//

// try {
//   // Create an order item with the same orderId
//   const orderItems = {
//     orderId: order.orderId,
//     productId: "12345",
//     quantity: order.productQuantity,
//     customerId: order.customerId,
//     // Add other order item properties here
//   };
//   // Add the order item to the database
//   const orderItemId = await addOrderItem({
//     redisClient,
//     orderItem: orderItems,
//   });
//
//
//
//
// } catch (error) {
//   console.error("Error creating order item:", error);
//   res.status(500).send("Internal Server Error");
//   return;
// }
