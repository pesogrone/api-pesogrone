// Import Redis client
const Redis = require("redis");

// Create Redis client
const redisClient = Redis.createClient({
  url: "redis://localhost:6379",
});

// Function to add an order item to Redis
const addOrderItem = async ({ redisClient, orderItem }) => {
  try {
    // Create unique key for order item
    const orderItemId = `${orderItem.customerId}-${Date.now()}`;
    orderItem.orderItemId = orderItemId;
    
    // Store order item in Redis
    await redisClient.json.set(`orderItem:${orderItemId}`, '$', orderItem);

    console.log("Order item ID:", orderItemId);
    return orderItemId; // Return the generated order item ID
  } catch (error) {
    throw new Error(`Error adding order item: ${error}`);
  }
};


// Function to update an order item in Redis
const updateOrderItem = async ({ redisClient, orderItem }) => {
  try {
    // Check if the order item exists in Redis
    const existingOrderItem = await redisClient.json.get(`orderItem:${orderItem.orderItemId}`);

    if (existingOrderItem !== null) {
      // Update the order item in Redis
      await redisClient.json.set(`orderItem:${orderItem.orderItemId}`, '$', orderItem);
    } else {
      throw new Error(`Order item with ID ${orderItem.orderItemId} does not exist`);
    }
  } catch (error) {
    throw new Error(`Error updating order item: ${error}`);
  }
};

// Function to retrieve an order item from Redis
const getOrderItem = async ({ redisClient, orderItemId }) => {
  try {
    // Retrieve the order item from Redis
    const orderItem = await redisClient.json.get(`orderItem:${orderItemId}`);

    if (orderItem !== null) {
      return orderItem;
    } else {
      throw new Error(`Order item with ID ${orderItemId} does not exist`);
    }
  } catch (error) {
    throw new Error(`Error retrieving order item: ${error}`);
  }
};

// Function to search for order items in Redis
const searchOrderItems = async ({ redisClient, query, key, isText }) => {
  try {
    let value = query[key];
    const resultObject = isText ? await redisClient.ft.search('idx:OrderItem', `@${key}:(${value}*)`) : await redisClient.ft.search('idx:OrderItem', `@${key}:{${value}}`);
    return resultObject.documents.map(resultObject => ({ ...resultObject.value, orderItemId: resultObject.id.split(':')[1] }));
  } catch (error) {
    throw new Error(`Error searching for order items: ${error}`);
  }
};

// Export functions for use in other files
module.exports = { addOrderItem, updateOrderItem, getOrderItem, searchOrderItems };
module.exports.redisClient = redisClient;