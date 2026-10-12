const OrderModel   = require('../models/order.model');
const ProductModel = require('../models/product.model');
const CouponModel  = require('../models/coupon.model');

const VALID_STATUSES        = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const VALID_PAYMENT_METHODS = ['tarjeta', 'billetera', 'transferencia'];

const TAX_RATE = 0.21; // IVA 21%

/**
 * POST /api/orders
 * Crea un nuevo pedido con medio de pago, cupón e IVA
 */
async function createOrder(req, res) {
  const { items, shipping, payment } = req.body;
  const userId = req.user.id;

  // Validar items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' });
  }

  // Validar medio de pago
  const method = payment?.method || 'tarjeta';
  if (!VALID_PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({
      error: `Medio de pago inválido. Valores permitidos: ${VALID_PAYMENT_METHODS.join(', ')}.`,
    });
  }

  // Validar datos de tarjeta si el método es tarjeta
  if (method === 'tarjeta') {
    if (!payment?.card_number || payment.card_number.replace(/\s/g, '').length < 13) {
      return res.status(400).json({ error: 'Número de tarjeta inválido.' });
    }
    if (!payment?.card_name) {
      return res.status(400).json({ error: 'Nombre en la tarjeta es requerido.' });
    }
    if (!payment?.card_expiry) {
      return res.status(400).json({ error: 'Fecha de vencimiento es requerida.' });
    }
    if (!payment?.card_cvv || payment.card_cvv.length < 3) {
      return res.status(400).json({ error: 'CVV inválido.' });
    }
  }

  // Verificar stock y tomar precio del backend (seguro)
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
    // Precio siempre desde el backend
    item.unit_price = parseFloat(product.price);
  }

  // Calcular subtotal
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  // Aplicar cupón desde BD
  let discountAmount = 0;
  let couponCode     = null;
  if (payment?.coupon_code) {
    const coupon = await CouponModel.findByCode(payment.coupon_code);
    if (coupon) {
      discountAmount = +(subtotal * (coupon.discount_percent / 100)).toFixed(2);
      couponCode     = coupon.code;
    }
    // Cupón inválido no es error fatal — simplemente no aplica descuento
  }

  // Descuento adicional por billetera virtual (5% OFF)
  if (method === 'billetera') {
    discountAmount = +(discountAmount + subtotal * 0.05).toFixed(2);
  }

  // Calcular IVA sobre (subtotal - descuento) — base nunca puede ser negativa
  const baseForTax  = Math.max(subtotal - discountAmount, 0);
  const taxAmount   = +(baseForTax * TAX_RATE).toFixed(2);
  const totalWithTax = +(baseForTax + taxAmount).toFixed(2);

  // Extraer últimos 4 dígitos de la tarjeta (solo si método es tarjeta)
  const cardLast4 = method === 'tarjeta'
    ? payment.card_number.replace(/\s/g, '').slice(-4)
    : null;

  const paymentData = {
    method,
    card_last4:      cardLast4,
    card_brand:      payment?.card_brand    || null,
    card_type:       payment?.card_type     || null,
    installments:    payment?.installments  || 1,
    coupon_code:     couponCode,
    discount_amount: discountAmount,
    tax_amount:      taxAmount,
    total_with_tax:  totalWithTax,
  };

  const order = await OrderModel.create(userId, items, shipping || {}, paymentData);

  return res.status(201).json({
    message: 'Pedido confirmado exitosamente.',
    order: {
      ...order,
      subtotal,
      discount_amount: discountAmount,
      tax_amount:      taxAmount,
      total_with_tax:  totalWithTax,
    },
  });
}

/**
 * POST /api/orders/validate-coupon
 * Valida un cupón y devuelve el porcentaje de descuento
 */
async function validateCoupon(req, res) {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código requerido.' });

  const coupon = await CouponModel.findByCode(code);

  if (!coupon) {
    return res.status(404).json({ error: 'Cupón inválido o expirado.' });
  }

  return res.status(200).json({ code: coupon.code, discount_percent: coupon.discount_percent });
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
  const { id }     = req.params;
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

  return res.status(200).json({ message: 'Estado del pedido actualizado.', order });
}

/**
 * GET /api/orders/admin/coupons — lista cupones activos — solo admin
 */
async function getCoupons(req, res) {
  const coupons = await CouponModel.findAll();
  return res.status(200).json({ coupons, total: coupons.length });
}

/**
 * POST /api/orders/admin/coupons — crea un cupón — solo admin
 */
async function createCoupon(req, res) {
  const { code, discount_percent } = req.body;

  if (!code || !discount_percent) {
    return res.status(400).json({ error: 'Código y porcentaje de descuento son requeridos.' });
  }

  const normalized = code.toUpperCase().trim().replace(/\s/g, '');
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return res.status(400).json({ error: 'El código solo puede contener letras y números.' });
  }

  const pct = Number(discount_percent);
  if (isNaN(pct) || pct <= 0 || pct >= 100) {
    return res.status(400).json({ error: 'El porcentaje debe ser un número entre 1 y 99.' });
  }

  const exists = await CouponModel.existsByCode(normalized);
  if (exists) {
    return res.status(409).json({ error: `El cupón ${normalized} ya existe.` });
  }

  const coupon = await CouponModel.create(normalized, pct);
  return res.status(201).json({ message: 'Cupón creado.', coupon });
}

/**
 * DELETE /api/orders/admin/coupons/:code — desactiva un cupón — solo admin
 */
async function deleteCoupon(req, res) {
  const code = (req.params.code ?? '').toUpperCase().trim();

  if (!code) {
    return res.status(400).json({ error: 'Código requerido.' });
  }

  const coupon = await CouponModel.deactivate(code);
  if (!coupon) {
    return res.status(404).json({ error: `Cupón ${code} no encontrado.` });
  }

  return res.status(200).json({ message: `Cupón ${code} eliminado.` });
}

module.exports = {
  createOrder,
  validateCoupon,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getCoupons,
  createCoupon,
  deleteCoupon,
};
