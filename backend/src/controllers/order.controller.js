const OrderModel = require('../models/order.model');
const ProductModel = require('../models/product.model');

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/**
 * POST /api/orders
 * Crea un nuevo pedido (checkout simulado)
 * Requiere autenticación
 */
async function createOrder(req, res) {
  const { items, shipping } = req.body;
  const userId = req.user.id;

  // Validaciones básicas
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' });
  }

  // Verificar que cada item tiene los campos requeridos y stock disponible
  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ error: 'Cada item debe tener product_id y quantity válidos.' });
    }

    const product = await ProductModel.findById(item.product_id);
    if (!product) {
      return res.status(404).json({ error: `Producto #${item.product_id} no encontrado.` });
    }

    if (product.stock < item.quantity) {
      return res.status(409).json({
        error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}.`,
      });
    }

    // Tomar el precio actual del producto (no confiar en el cliente)
    item.unit_price = parseFloat(product.price);
  }

  const order = await OrderModel.create(userId, items, shipping || {});

  return res.status(201).json({
    message: 'Pedido confirmado exitosamente.',
    order,
  });
}

/**
 * GET /api/orders
 * Lista los pedidos del usuario autenticado
 */
async function getMyOrders(req, res) {
  const orders = await OrderModel.findByUserId(req.user.id);
  return res.status(200).json({ orders, total: orders.length });
}

/**
 * GET /api/orders/:id
 * Detalle de un pedido del usuario autenticado
 */
async function getOrderById(req, res) {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del pedido debe ser un número.' });
  }

  const order = await OrderModel.findById(Number(id), req.user.id);

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  return res.status(200).json({ order });
}

/**
 * GET /api/orders/admin/all
 * Lista todos los pedidos — solo admin
 */
async function getAllOrders(req, res) {
  const orders = await OrderModel.findAll();
  return res.status(200).json({ orders, total: orders.length });
}

/**
 * PATCH /api/orders/admin/:id/status
 * Actualiza el estado de un pedido — solo admin
 */
async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del pedido debe ser un número.' });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}.`,
    });
  }

  const order = await OrderModel.updateStatus(Number(id), status);

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  return res.status(200).json({
    message: 'Estado del pedido actualizado.',
    order,
  });
}

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
