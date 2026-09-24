const { query, pool } = require('../config/db');

/**
 * Modelo de Pedido
 * Todas las operaciones SQL sobre orders + order_items
 */

const OrderModel = {
  /**
   * Crea un pedido con sus items en una transacción atómica
   * @param {number} userId
   * @param {Array}  items - [{ product_id, quantity, unit_price }]
   * @param {Object} shipping - { name, address, city, phone, notes }
   * @returns {Object} pedido creado con items
   */
  async create(userId, items, shipping = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calcular total
      const total = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      // Insertar orden
      const orderRes = await client.query(
        `INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_city, shipping_phone, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          total,
          shipping.name    || null,
          shipping.address || null,
          shipping.city    || null,
          shipping.phone   || null,
          shipping.notes   || null,
        ]
      );
      const order = orderRes.rows[0];

      // Insertar items
      const insertedItems = [];
      for (const item of items) {
        const itemRes = await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [order.id, item.product_id, item.quantity, item.unit_price]
        );
        insertedItems.push(itemRes.rows[0]);

        // Descontar stock del producto
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
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'subtotal', oi.subtotal
                )
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * Busca un pedido por ID — verifica que pertenezca al usuario
   * (o skipea verificación si es admin)
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
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'subtotal', oi.subtotal
                )
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
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
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
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
