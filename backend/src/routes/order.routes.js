const { Router } = require('express');
const {
  createOrder,
  validateCoupon,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Todas las rutas de pedidos requieren autenticación
router.use(authenticate);

// ── Rutas de cliente ──────────────────────────────────────────────────────────

// POST /api/orders — crear pedido (checkout)
router.post('/', createOrder);

// POST /api/orders/validate-coupon — validar cupón
router.post('/validate-coupon', validateCoupon);

// GET /api/orders — mis pedidos
router.get('/', getMyOrders);

// ── Rutas de administración (deben ir ANTES de /:id para no ser interceptadas) ──

// GET /api/orders/admin/all — todos los pedidos
router.get('/admin/all', requireAdmin, getAllOrders);

// PATCH /api/orders/admin/:id/status — cambiar estado
router.patch('/admin/:id/status', requireAdmin, updateOrderStatus);

// GET /api/orders/:id — detalle de un pedido propio (al final para no interceptar /admin/*)
router.get('/:id', getOrderById);

module.exports = router;
