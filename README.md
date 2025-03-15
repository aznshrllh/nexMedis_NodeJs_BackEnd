# NexMedis Node.js Backend

Backend API for NexMedis pharmacy management system with Midtrans payment integration.

For the frontend application, please refer to:
https://github.com/aznshrllh/nexMedis_NodeJs_FE

See the README.md in that repository for frontend setup and usage instructions.

## Solutions to NexMedis Backend Challenge

### 1. E-commerce API Design

This NexMedis backend implements a comprehensive e-commerce API with:

#### User Registration and Authentication

- **POST /api/register**: Creates a new user account
- **POST /api/login**: Authenticates a user and returns a JWT

#### Products Management

- **GET /api/products**: Lists all products, with optional search functionality
- **GET /api/products/:id**: Returns details for a specific product
- **GET /api/products?search=[keyword]**: Searches products by name

#### Shopping Cart

- **GET /api/carts**: Retrieves user's cart contents
- **POST /api/carts**: Adds an item to cart
- **PUT /api/carts/:id**: Updates quantity of a cart item
- **DELETE /api/carts/:id**: Removes an item from cart
- **DELETE /api/carts**: Clears the entire cart

#### Purchase Completion

- **POST /api/transactions**: Creates an order from cart items
- **GET /api/transactions**: Lists user's orders
- **GET /api/transactions/:id**: Retrieves a specific order
- **PUT /api/transactions/:id/status**: Updates order status

This API architecture follows RESTful principles with consistent URL structure and HTTP methods. Authentication middleware ensures protected routes are secure.

### 2. Database Indexing Strategy

For the Users table with columns: id, username, email, created_at, we implemented the following indexing strategy:

#### Individual Indexes

- **username**: Created a unique index on username since it's used for exact lookups
- **email**: Created a unique index on email for authentication and exact lookups
- **created_at**: Created a non-unique index to optimize date range queries

This approach optimally supports the three query patterns:

- Fetch user by username (exact match)
- Fetch users who signed up after a certain date (range query)
- Fetch user by email (exact match)

We chose individual indexes over composite indexes because:

1. Each query only uses one field as filtration criteria
2. These columns aren't typically queried together in combinations
3. Individual indexes provide better flexibility for various query patterns

Trade-offs considered:

- Read performance is improved for the specific queries
- Write performance is slightly decreased due to index maintenance
- Storage requirements increase to accommodate the indexes

### 3. Top Customers Query Optimization

To find top customers by spending in the past month, we implemented:

```sql
SELECT
  "Orders".user_id as customer_id,
  "Users".username,
  "Users".email,
  COUNT("Orders".id) as order_count,
  SUM("Orders".total) AS total_spent
FROM
  "Orders"
JOIN
  "Users" ON "Orders".user_id = "Users".id
WHERE
  "Orders"."createdAt" >= NOW() - INTERVAL '1 month'
  AND "Orders".status = 'completed'
GROUP BY
  "Orders".user_id, "Users".username, "Users".email
ORDER BY
  total_spent DESC
LIMIT 5
```

Performance optimizations:

1. We created an index on Orders.user_id for efficient JOIN operations
2. We added an index on Orders.createdAt to optimize the date range filter
3. We limited results to only 5 records to minimize data transfer
4. We included a status filter to only count completed orders

In production, we've implemented:

- Parameters for configurable time periods (e.g., "7 days", "1 month", "1 year")
- Caching of query results to avoid redundant expensive calculations
- Partial indexing to focus on recent orders and active customers
- Database query optimization through EXPLAIN ANALYZE

### 4. Microservice Refactoring Approach

The NexMedis backend demonstrates a well-structured approach to managing distinct business domains:

1. **Authentication Service**: Handles user registration, login and token verification
2. **Product Service**: Manages product data, searches and inventory
3. **Cart Service**: Handles shopping cart operations
4. **Order Service**: Manages order processing and payment integration
5. **Analytics Service**: Provides business insights like top customer reports

Each service has:

- Well-defined responsibilities with clear boundaries
- Independent data access patterns
- Dedicated controllers and models
- Standardized error handling

Backward compatibility is maintained through:

- API versioning
- Consistent endpoint structure
- Authentication middleware that works across services
- Centralized error handling
- Comprehensive documentation for all endpoints

This architecture allows independent scaling and maintenance while ensuring a smooth transition from a monolithic approach to a more modular system.

## Setup Instructions

### 1. Installation

```bash
# Clone repository
git clone https://github.com/aznshrllh/nexMedis_NodeJs_BackEnd.git
cd nexMedis_NodeJs_BackEnd

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```
SECRET=your_jwt_secret_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### 3. Database Setup

Update `config/config.json` with your database credentials:

```json
{
  "development": {
    "username": "your_username",
    "password": "your_password",
    "database": "nexmedis_db",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "your_username",
    "password": "your_password",
    "database": "nexmedis_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "your_username",
    "password": "your_password",
    "database": "nexmedis_production",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

### 4. Database Migration and Seeding

```bash
# Create database
npx sequelize-cli db:create

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data (categories, statuses, products)
npx sequelize-cli db:seed --seed 20250314-seed-initial-data.js
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on port 3000 by default.

## API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/register
```

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "email": "john@example.com"
}
```

#### Login

```
POST /api/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "message": "Login success",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Product Endpoints

#### Get All Products

```
GET /api/products
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "id_produk": "OBR-001",
    "nama_produk": "Paracetamol 500mg",
    "harga": 10000,
    "kategori_id": 2,
    "status_id": 1,
    "stok": 120,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
  // More products...
]
```

#### Search Products

```
GET /api/products?search=paracetamol
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "id_produk": "OBR-001",
    "nama_produk": "Paracetamol 500mg",
    "harga": 10000,
    "kategori_id": 2,
    "status_id": 1,
    "stok": 120,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
]
```

#### Get Product by ID

```
GET /api/products/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": 1,
  "id_produk": "OBR-001",
  "nama_produk": "Paracetamol 500mg",
  "harga": 10000,
  "kategori_id": 2,
  "status_id": 1,
  "stok": 120,
  "createdAt": "2025-03-14T00:00:00.000Z",
  "updatedAt": "2025-03-14T00:00:00.000Z"
}
```

### Cart Endpoints

#### Get User Cart

```
GET /api/carts
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "nama_produk": "Paracetamol 500mg",
        "harga": 10000,
        "id_produk": "OBR-001"
      },
      "subtotal": 20000
    }
  ],
  "total": 20000,
  "count": 1
}
```

#### Add to Cart

```
POST /api/carts
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (201 Created):**

```json
{
  "message": "Produk berhasil ditambahkan ke keranjang",
  "cartItem": {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2,
    "updatedAt": "2025-03-15T09:30:00.000Z",
    "createdAt": "2025-03-15T09:30:00.000Z"
  }
}
```

#### Update Cart Item

```
PUT /api/carts/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response (200 OK):**

```json
{
  "message": "Quantity produk di keranjang berhasil diupdate",
  "cartItem": {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 3,
    "createdAt": "2025-03-15T09:30:00.000Z",
    "updatedAt": "2025-03-15T09:35:00.000Z",
    "Product": {
      "id": 1,
      "nama_produk": "Paracetamol 500mg",
      "harga": 10000,
      "stok": 120
    }
  }
}
```

#### Remove from Cart

```
DELETE /api/carts/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "message": "Item berhasil dihapus dari keranjang"
}
```

#### Clear Cart

```
DELETE /api/carts
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "message": "Keranjang berhasil dikosongkan"
}
```

### Transaction Endpoints

#### Create Transaction

```
POST /api/transactions
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (201 Created):**

```json
{
  "message": "Pesanan berhasil dibuat dan sudah dibayar",
  "order": {
    "id": 1,
    "total": 20000,
    "status": "processing",
    "createdAt": "2025-03-15T10:00:00.000Z"
  },
  "payment": {
    "status": "success",
    "token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/66e4fa55-fdac-4ef9-91b5-733b97d1b862"
  }
}
```

#### Get User Transactions

```
GET /api/transactions
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "total": 20000,
    "status": "processing",
    "createdAt": "2025-03-15T10:00:00.000Z",
    "updatedAt": "2025-03-15T10:00:00.000Z",
    "orderDetails": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 10000,
        "Product": {
          "id": 1,
          "nama_produk": "Paracetamol 500mg",
          "id_produk": "OBR-001"
        }
      }
    ],
    "payment": {
      "id": 1,
      "order_id": 1,
      "payment_method": "midtrans",
      "payment_status": "success",
      "payment_token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
      "amount": 20000,
      "createdAt": "2025-03-15T10:00:00.000Z",
      "updatedAt": "2025-03-15T10:00:00.000Z"
    }
  }
]
```

#### Get Transaction by ID

```
GET /api/transactions/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": 1,
  "user_id": 1,
  "total": 20000,
  "status": "processing",
  "createdAt": "2025-03-15T10:00:00.000Z",
  "updatedAt": "2025-03-15T10:00:00.000Z",
  "orderDetails": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 1,
      "quantity": 2,
      "price": 10000,
      "Product": {
        "id": 1,
        "nama_produk": "Paracetamol 500mg",
        "harga": 10000,
        "id_produk": "OBR-001"
      }
    }
  ],
  "User": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "Payment": {
    "id": 1,
    "payment_method": "midtrans",
    "payment_status": "success",
    "payment_token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "amount": 20000
  }
}
```

#### Update Transaction Status

```
PUT /api/transactions/:id/status
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "status": "delivered"
}
```

**Response (200 OK):**

```json
{
  "message": "Status transaksi berhasil diperbarui",
  "order": {
    "id": 1,
    "status": "delivered",
    "updatedAt": "2025-03-15T12:00:00.000Z"
  }
}
```

### Analytics Endpoints

#### Get Top Customers

```
GET /api/user/toptransactions?period=1%20month
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `period`: (optional) Time period for analysis. Valid values: "7 days", "14 days", "1 month", "3 months", "6 months", "1 year". Default: "1 month"

**Response (200 OK):**

```json
{
  "message": "Top customers by spending in the last 1 month",
  "period": "1 month",
  "customers": [
    {
      "customer_id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "order_count": 5,
      "total_spent": 150000
    },
    {
      "customer_id": 2,
      "username": "janedoe",
      "email": "jane@example.com",
      "order_count": 3,
      "total_spent": 100000
    }
  ]
}
```

### Midtrans Payment Integration

The system uses Midtrans as the payment gateway. When a transaction is created, a payment token is generated and returned to the client. The client can then use this token to redirect the user to the Midtrans payment page.

#### Midtrans Notification URL

```
POST /api/midtrans/notification
```

This endpoint receives payment notifications from Midtrans and updates the order status accordingly.

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Models

The system includes the following data models:

- **User**: User accounts for authentication
- **Product**: Product information including stock level
- **Category**: Product categories (e.g., Obat Resep, Obat Bebas)
- **Status**: Status values for products and orders
- **Cart**: Shopping cart items
- **Order**: Order information
- **OrderDetail**: Line items for each order
- **Payment**: Payment information linked to orders

## Technology Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Tokens (JWT) for authentication
- Midtrans for payment processing
- Bcrypt for password hashing
- Zod for data validation
