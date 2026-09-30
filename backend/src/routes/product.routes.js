const { Router } = require('express');
const {
  getProducts,
  getProductById,
  getProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  renameCategory,
} = require('../controllers/product.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// ── Rutas públicas ────────────────────────────────────────────────────────────

// GET /api/products — lista productos activos (con filtros opcionales)
router.get('/', getProducts);

// ── Rutas de administración (requieren JWT + rol admin) ───────────────────────

// GET /api/products/admin/all — lista todos (incluye inactivos)
router.get('/admin/all', authenticate, requireAdmin, getProductsAdmin);

// GET /api/products/admin/categories — lista categorías únicas con conteo
router.get('/admin/categories', authenticate, requireAdmin, getCategories);

// PATCH /api/products/admin/categories/rename — renombra una categoría
router.patch('/admin/categories/rename', authenticate, requireAdmin, renameCategory);

// POST /api/products/admin — crear producto
router.post('/admin', authenticate, requireAdmin, createProduct);

// PUT /api/products/admin/:id — actualizar producto
router.put('/admin/:id', authenticate, requireAdmin, updateProduct);

// DELETE /api/products/admin/:id — eliminar producto (soft delete)
router.delete('/admin/:id', authenticate, requireAdmin, deleteProduct);

// GET /api/products/:id — detalle de un producto (al final para no interceptar /admin/*)
router.get('/:id', getProductById);

module.exports = router;
