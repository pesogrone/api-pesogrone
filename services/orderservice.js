const addOrder = async ({ redisClient, order }) => {
  //Temporary hardcoding of customer ID
  order.customerId = 3852656789;
  //use the const to pull the customer ID from the order object

  const existingCustomer = order.customerId;
  const customerKey = `customer:${order.customerId}`;
  //const existingCustomer = await redisClient.json.get(customerKey);
  if (existingCustomer !== null) {
    const orderKey = `order:${order.customerId}-${Date.now()}`;
    order.orderId = orderKey;

    // Create the order data in Redis
    await redisClient.json.set(orderKey, "$", order);
  } else {
    throw new Error(`Customer ${customerKey} does not exist`);
  }
};
const getOrder = async ({ redisClient, orderId }) => {
  const resultObject = await redisClient.json.get(`order:${orderId}`);
  return resultObject;
};
//module.exports = { addOrder, getOrder };
module.exports = { addOrder, getOrder };
