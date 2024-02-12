const redis = require("redis");

// Create a Redis client
const client = redis.createClient();

// Connect to Redis
client.on("connect", () => {
  console.log("Connected to Redis");
});

// Handle GET request
function getOrder(orderId) {
  return new Promise((resolve, reject) => {
    client.get(orderId, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Handle POST request
function createOrder(orderId, orderData) {
  return new Promise((resolve, reject) => {
    client.set(orderId, orderData, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  getOrder,
  createOrder,
};
