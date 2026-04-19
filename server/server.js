const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Path to products.json file
// Adjusted to point to the UI assets folder
const PRODUCTS_FILE = path.join(__dirname, '../Ecommerce.UI/src/app/asset/files/products.json');
const DATA_DIR = path.dirname(PRODUCTS_FILE);

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Read products from file
function readProductsFile() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
}

// Helper: Write products to file
function writeProductsFile(products) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing products file:', error);
    return false;
  }
}

// Helper: Get next available ID
function getNextId(products) {
  return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

// ============================================================
// ROUTES - READ OPERATIONS
// ============================================================

/**
 * GET /api/products
 * Get all products
 */
app.get('/api/products', (req, res) => {
  try {
    const products = readProductsFile();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/:id
 * Get product by ID
 */
app.get('/api/products/:id', (req, res) => {
  try {
    const products = readProductsFile();
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/search?term=...
 * Search products
 */
app.get('/api/products/search', (req, res) => {
  try {
    const products = readProductsFile();
    const term = req.query.term?.toLowerCase() || '';
    
    if (!term) {
      return res.json(products);
    }

    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/category/:category
 * Get products by category
 */
app.get('/api/products/category/:category', (req, res) => {
  try {
    const products = readProductsFile();
    const filtered = products.filter(p => p.category === req.params.category);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats
 * Get product statistics
 */
app.get('/api/stats', (req, res) => {
  try {
    const products = readProductsFile();
    const categories = [...new Set(products.map(p => p.category))];
    const avgPrice = products.reduce((sum, p) => sum + p.currentPrice, 0) / (products.length || 1);
    const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / (products.length || 1);

    res.json({
      total: products.length,
      categories,
      avgPrice: Math.round(avgPrice * 100) / 100,
      avgRating: Math.round(avgRating * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// ROUTES - CREATE OPERATIONS
// ============================================================

/**
 * POST /api/products/create
 * Create new product
 */
app.post('/api/products/create', (req, res) => {
  try {
    const products = readProductsFile();
    const newProduct = {
      id: getNextId(products),
      ...req.body,
      liked: false
    };

    products.push(newProduct);
    
    if (writeProductsFile(products)) {
      res.status(201).json(newProduct);
    } else {
      res.status(500).json({ error: 'Failed to save product' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// ROUTES - UPDATE OPERATIONS
// ============================================================

/**
 * PUT /api/products/:id
 * Update product
 */
app.put('/api/products/:id', (req, res) => {
  try {
    const products = readProductsFile();
    const index = products.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = { ...products[index], ...req.body, id: parseInt(req.params.id) };
    products[index] = updatedProduct;

    if (writeProductsFile(products)) {
      res.json(updatedProduct);
    } else {
      res.status(500).json({ error: 'Failed to update product' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/products/bulk/update
 * Bulk update products
 */
app.put('/api/products/bulk/update', (req, res) => {
  try {
    const products = readProductsFile();
    const updates = req.body; // Array of { id, changes }
    let updatedCount = 0;

    updates.forEach(({ id, changes }) => {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...changes, id };
        updatedCount++;
      }
    });

    if (updatedCount > 0 && writeProductsFile(products)) {
      res.json({ success: true, updated: updatedCount });
    } else {
      res.status(500).json({ error: 'Failed to update products' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/products/prices/multiply
 * Update all prices with multiplier
 */
app.put('/api/products/prices/multiply', (req, res) => {
  try {
    const { multiplier } = req.body;
    if (!multiplier || multiplier <= 0) {
      return res.status(400).json({ error: 'Invalid multiplier' });
    }

    const products = readProductsFile();
    products.forEach(p => {
      p.currentPrice = Math.round(p.currentPrice * multiplier * 100) / 100;
      p.originalPrice = Math.round(p.originalPrice * multiplier * 100) / 100;
    });

    if (writeProductsFile(products)) {
      res.json({ success: true, multiplier, count: products.length });
    } else {
      res.status(500).json({ error: 'Failed to update prices' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/products/category/:category/discount
 * Apply discount to category
 */
app.put('/api/products/category/:category/discount', (req, res) => {
  try {
    const { discountPercent } = req.body;
    const category = req.params.category;

    if (discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ error: 'Invalid discount percentage' });
    }

    const products = readProductsFile();
    let updatedCount = 0;

    products.forEach(p => {
      if (p.category === category) {
        p.currentPrice = Math.round(p.currentPrice * (1 - discountPercent / 100) * 100) / 100;
        p.discount = discountPercent;
        updatedCount++;
      }
    });

    if (updatedCount > 0 && writeProductsFile(products)) {
      res.json({ success: true, category, discount: discountPercent, updated: updatedCount });
    } else {
      res.status(500).json({ error: 'Failed to apply discount' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// ROUTES - DELETE OPERATIONS
// ============================================================

/**
 * DELETE /api/products/:id
 * Delete product
 */
app.delete('/api/products/:id', (req, res) => {
  try {
    const products = readProductsFile();
    const index = products.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deleted = products.splice(index, 1);

    if (writeProductsFile(products)) {
      res.json({ success: true, deleted: deleted[0] });
    } else {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/products/bulk/delete
 * Delete multiple products
 */
app.delete('/api/products/bulk/delete', (req, res) => {
  try {
    const { ids } = req.body; // Array of IDs
    const products = readProductsFile();
    const before = products.length;

    const filtered = products.filter(p => !ids.includes(p.id));
    const deleted = before - filtered.length;

    if (deleted > 0 && writeProductsFile(filtered)) {
      res.json({ success: true, deleted });
    } else {
      res.status(500).json({ error: 'Failed to delete products' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/products/all
 * Clear all products
 */
app.delete('/api/products/all', (req, res) => {
  try {
    if (writeProductsFile([])) {
      res.json({ success: true, message: 'All products deleted' });
    } else {
      res.status(500).json({ error: 'Failed to clear products' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// ROUTES - IMPORT/EXPORT OPERATIONS
// ============================================================

/**
 * POST /api/products/import
 * Import products from JSON
 */
app.post('/api/products/import', (req, res) => {
  try {
    const imported = req.body; // Should be array

    if (!Array.isArray(imported)) {
      return res.status(400).json({ error: 'Invalid format. Expected array of products.' });
    }

    const validated = imported.every(p =>
      p.id && p.name && p.description && p.currentPrice !== undefined &&
      p.originalPrice !== undefined && p.discount !== undefined
    );

    if (!validated) {
      return res.status(400).json({ error: 'Some products have missing required fields.' });
    }

    if (writeProductsFile(imported)) {
      res.json({ success: true, count: imported.length });
    } else {
      res.status(500).json({ error: 'Failed to import products' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/products/save-all
 * Save all products to file
 */
app.post('/api/products/save-all', (req, res) => {
  try {
    const products = req.body; // Should be array

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Expected array of products' });
    }

    if (writeProductsFile(products)) {
      res.json({ success: true, count: products.length });
    } else {
      res.status(500).json({ error: 'Failed to save products' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/products/export/json
 * Export all products as JSON
 */
app.get('/api/products/export/json', (req, res) => {
  try {
    const products = readProductsFile();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="products-${Date.now()}.json"`);
    res.send(JSON.stringify(products, null, 2));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/products/reset
 * Reset to original products (reload from template)
 */
app.post('/api/products/reset', (req, res) => {
  try {
    // Read the original file again
    const products = readProductsFile();
    res.json({ success: true, message: 'Products reset', count: products.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * GET /
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ecommerce Products API Server',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      stats: '/api/stats',
      health: '/health'
    }
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Ecommerce Backend Server running on http://localhost:${PORT}`);
  console.log(`📁 Products file: ${PRODUCTS_FILE}`);
  console.log(`\n📚 API Documentation:`);
  console.log(`   GET  /api/products          - Get all products`);
  console.log(`   GET  /api/products/:id      - Get product by ID`);
  console.log(`   POST /api/products/create   - Create new product`);
  console.log(`   PUT  /api/products/:id      - Update product`);
  console.log(`   DELETE /api/products/:id    - Delete product`);
  console.log(`   GET  /api/stats             - Get statistics`);
  console.log(`   GET  /health                - Health check\n`);
});

module.exports = app;
