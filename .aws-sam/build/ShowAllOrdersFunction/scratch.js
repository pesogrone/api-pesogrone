const response = {
  productQuantity: 1,
  shippingAddress: "123 Main Street",
};

let responseStatus =
  response.productQuantity && response.shippingAddress ? 200 : 400;
console.log("response: ", responseStatus);
