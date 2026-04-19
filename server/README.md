# Ecommerce Backend Server Setup

This backend server handles all product CRUD operations and persists data to `products.json` file instead of localStorage.

## Features

- ✅ **Read/Write to products.json** - All data persisted to file system
- ✅ **Complete CRUD API** - Create, Read, Update, Delete operations
- ✅ **Bulk Operations** - Batch update, delete, price adjustments
- ✅ **Import/Export** - JSON file import and export functionality
- ✅ **Search & Filter** - Search products and filter by category
- ✅ **Statistics** - View product statistics and analytics
- ✅ **CORS Enabled** - Works with Angular frontend

## Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Backend Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### READ Operations
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?term=...` - Search products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/stats` - Get statistics

### CREATE Operations
- `POST /api/products/create` - Create new product

### UPDATE Operations
- `PUT /api/products/:id` - Update product
- `PUT /api/products/bulk/update` - Bulk update products
- `PUT /api/products/prices/multiply` - Multiply all prices
- `PUT /api/products/category/:category/discount` - Apply discount to category

### DELETE Operations
- `DELETE /api/products/:id` - Delete product
- `DELETE /api/products/bulk/delete` - Bulk delete products
- `DELETE /api/products/all` - Clear all products

### IMPORT/EXPORT Operations
- `POST /api/products/import` - Import products from JSON
- `POST /api/products/save-all` - Save all products
- `GET /api/products/export/json` - Export as JSON file
- `POST /api/products/reset` - Reset to original

## File Structure

```
server/
├── package.json          # Dependencies
├── server.js            # Main server file
└── ../Ecommerce.UI/
    └── src/app/asset/
        └── files/
            └── products.json  # Products data file
```

## Data Storage

All products are stored in: `Ecommerce.UI/src/app/asset/files/products.json`

Changes made through the API are automatically persisted to this file.

## Running Both Frontend and Backend

### Terminal 1 - Backend Server
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### Terminal 2 - Angular Frontend
```bash
cd Ecommerce.UI
npm start
# App runs on http://localhost:4200
```

## Example Usage

### Create Product
```bash
curl -X POST http://localhost:5000/api/products/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Description",
    "currentPrice": 100,
    "originalPrice": 150,
    "discount": 33,
    "rating": 4.5,
    "reviews": 10,
    "image": "/images/product/p.png",
    "badge": "New",
    "category": "Sheets",
    "features": ["feature1", "feature2"]
  }'
```

### Update Product
```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "currentPrice": 120,
    "discount": 20
  }'
```

### Delete Product
```bash
curl -X DELETE http://localhost:5000/api/products/1
```

### Export Products
```bash
curl -X GET http://localhost:5000/api/products/export/json \
  --output products.json
```

## Important Notes

- **No localStorage** - All data persists to `products.json` on the server
- **Fallback** - If server is unavailable, frontend falls back to loading from JSON file
- **CORS** - Server has CORS enabled for Angular frontend
- **Auto-Backup** - Keep backups of `products.json` before major operations

## Troubleshooting

### Server won't start
- Ensure port 5000 is not in use
- Check file permissions for `products.json`
- Verify Node.js is installed (v20.x required)

### Frontend can't connect to backend
- Check if server is running (`http://localhost:5000/health`)
- Ensure CORS is enabled on server
- Check browser console for errors

### Products not persisting
- Verify `products.json` file exists and is writable
- Check server logs for write errors
- Ensure sufficient disk space

## Support

For issues or questions, check:
1. Server console logs
2. Browser developer console
3. Network tab (check API calls)
4. CORS error messages

