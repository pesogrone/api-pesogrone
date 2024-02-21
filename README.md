# Website API Documentation

Welcome to the API documentation for our website selling two products. This API serves as the backend for the frontend of our e-commerce website. It allows users to view product information, place orders, and manage their accounts.

## Getting Started

To start using our API, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies using `npm install`.
3. Start the server using `npm start`.

##Some Endpoints explanation

### Products

- **GET /api/products**: Retrieves a list of all available products.
- **GET /api/products/{productId}**: Retrieves details of a specific product identified by its ID.

### Orders

- **POST /api/orders**: Places a new order for the specified product.
  - Request Body: `{ productId: string, quantity: number, customerId: string }`
- **GET /api/orders**: Retrieves a list of all orders placed.
- **GET /api/orders/{orderId}**: Retrieves details of a specific order identified by its ID.

### Customers

- **POST /api/customers**: Creates a new customer account.
  - Request Body: `{ name: string, email: string, address: string }`
- **GET /api/customers/{customerId}**: Retrieves details of a specific customer identified by its ID.


## Error Handling

Our API returns appropriate HTTP status codes and error messages to indicate the success or failure of each request. In case of an error, the response body will contain a JSON object with details about the error.

