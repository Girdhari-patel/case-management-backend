# Case Management Backend

Enterprise Metadata-Driven Case Management System — backend API for a Product search/dropdown field.

## Setup

```bash
cd case-management-backend
npm install
```

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

`.env`:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/case-management
```

## Seed the database (1000 products)

```bash
npm run seed
```

## Start the server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API

### GET /products/search

Query params:
- `productName` (optional) — case-insensitive regex search
- `limit` (optional, default 20, max 20)

Example:
```
GET http://localhost:3000/products/search?productName=para&limit=20
```

Response:
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "_id": "...", "productCode": "P0123", "productName": "Product 123" }
  ]
}
```

### GET /health

Basic health check, returns `{ "status": "ok" }`.
