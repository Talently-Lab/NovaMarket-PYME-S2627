const { query, pool } = require('../config/db');

/**
 * Modelo de Pedido
 * Todas las operaciones SQL sobre orders + order_items
 */

const OrderModel = {
  /**
   * Crea un pedido con sus items en una transacción atómica
   * @param {number} userId
   * @param {Array}  items    - [{ product_id, quantity, unit_price }]
   * @param {Object} shipping - { name, address, city, phone, notes }
   * @param {Object} payment  - { method, card_last4, card_brand, card_type,
   *                             installments, coupon_code, discount_amount,
   *                             tax_amount, total_with_tax }
   */
  async create(userId, items, shipping = {}, payment = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Subtotal de productos (sin IVA ni descuento)
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      // Valores de pago con defaults seguros
      const discount     = Number(payment.discount_amount  ?? 0);
      const tax          = Number(payment.tax_amount        ?? 0);
      const totalWithTax = Number(payment.total_with_tax    ?? subtotal);

      // Insertar orden
      const orderRes = await client.query(
        `INSERT INTO orders (
           user_id, total, status,
           shipping_name, shipping_address, shipping_city, shipping_phone, notes,
           payment_method, card_last4, card_brand, card_type,
           installments, coupon_code, discount_amount, tax_amount, total_with_tax
         )
         VALUES ($1, $2, 'confirmed', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          userId,
          subtotal,
          shipping.name    || null,
          shipping.address || null,
          shipping.city    || null,
          shipping.phone   || null,
          shipping.notes   || null,
          payment.method        || 'tarjeta',
          payment.card_last4    || null,
          payment.card_brand    || null,
          payment.card_type     || null,
          payment.installments  || 1,
          payment.coupon_code   || null,
          discount,
          tax,
          totalWithTax,
        ]
      );
      const order = orderRes.rows[0];

      // Insertar items y descontar stock
      const insertedItems = [];
      for (const item of items) {
        const itemRes = await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [order.id, item.product_id, item.quantity, item.unit_price]
        );
        insertedItems.push(itemRes.rows[0]);

        await client.query(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');
      return { ...order, items: insertedItems };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Lista los pedidos de un usuario específico
   */
  async findByUserId(userId) {
    const result = await query(
      `SELECT o.*,
              json_agg(
                json_build_object(
                  'id',           oi.id,
                  'product_id',   oi.product_id,
                  'product_name', p.name,
                  'quantity',     oi.quantity,
                  'unit_price',   oi.unit_price,
                  'subtotal',     oi.subtotal
                )
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p     ON p.id = oi.product_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * Busca un pedido por ID — verifica que pertenezca al usuario
   */
  async findById(orderId, userId = null) {
    const condition = userId
      ? 'o.id = $1 AND o.user_id = $2'
      : 'o.id = $1';
    const values = userId ? [orderId, userId] : [orderId];

    const result = await query(
      `SELECT o.*,
              json_agg(
                json_build_object(
                  'id',           oi.id,
                  'product_id',   oi.product_id,
                  'product_name', p.name,
                  'quantity',     oi.quantity,
                  'unit_price',   oi.unit_price,
                  'subtotal',     oi.subtotal
                )
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p     ON p.id = oi.product_id
       WHERE ${condition}
       GROUP BY o.id`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Lista todos los pedidos (admin)
   */
  async findAll() {
    const result = await query(
      `SELECT o.*,
              COALESCE(NULLIF(TRIM(u.name), ''), o.shipping_name, 'Usuario eliminado') AS user_name,
              u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    return result.rows;
  },

  /**
   * Actualiza el estado de un pedido (admin)
   */
  async updateStatus(orderId, status) {
    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, orderId]
    );
    return result.rows[0] || null;
  },
};

module.exports = OrderModel;
