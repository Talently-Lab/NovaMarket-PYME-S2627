const { Router } = require('express');
const {
  getProducts,
  getProductById,
  getProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// ── Rutas públicas ────────────────────────────────────────────────────────────

// GET /api/products — lista productos activos (con filtros opcionales)
router.get('/', getProducts);

// GET /api/products/:id — detalle de un producto
router.get('/:id', getProductById);

// ── Rutas de administración (requieren JWT + rol admin) ───────────────────────

// GET /api/products/admin/all — lista todos (incluye inactivos)
router.get('/admin/all', authenticate, requireAdmin, getProductsAdmin);

// POST /api/products/admin — crear producto
router.post('/admin', authenticate, requireAdmin, createProduct);

// PUT /api/products/admin/:id — actualizar producto
router.put('/admin/:id', authenticate, requireAdmin, updateProduct);

// DELETE /api/products/admin/:id — eliminar producto (soft delete)
router.delete('/admin/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
