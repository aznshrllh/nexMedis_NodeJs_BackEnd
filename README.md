# NexMedis Node.js Backend

Backend API for NexMedis pharmacy management system with Midtrans payment integration.

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
