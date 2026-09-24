const { Router } = require('express');
const {
  createOrder,
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

// GET /api/orders — mis pedidos
router.get('/', getMyOrders);

// GET /api/orders/:id — detalle de un pedido propio
router.get('/:id', getOrderById);

// ── Rutas de administración ───────────────────────────────────────────────────

// GET /api/orders/admin/all — todos los pedidos
router.get('/admin/all', requireAdmin, getAllOrders);

// PATCH /api/orders/admin/:id/status — cambiar estado
router.patch('/admin/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
