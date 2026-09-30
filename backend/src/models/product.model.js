const { query } = require('../config/db');

/**
 * Modelo de Producto
 * Todas las operaciones SQL sobre la tabla `products`
 */

const ProductModel = {
  /**
   * Lista todos los productos activos con filtros opcionales
   * @param {Object} filters - { category, minPrice, maxPrice, order }
   * @returns {Array} lista de productos
   */
  async findAll({ category, minPrice, maxPrice, order } = {}) {
    const conditions = ['is_active = true'];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`category ILIKE $${idx++}`);
      values.push(`%${category}%`);
    }

    if (minPrice !== undefined) {
      conditions.push(`price >= $${idx++}`);
      values.push(minPrice);
    }

    if (maxPrice !== undefined) {
      conditions.push(`price <= $${idx++}`);
      values.push(maxPrice);
    }

    const orderClause =
      order === 'price_asc'  ? 'price ASC' :
      order === 'price_desc' ? 'price DESC' :
      order === 'newest'     ? 'created_at DESC' :
      'created_at DESC'; // default

    const sql = `
      SELECT id, name, description, price, stock, category, image_url, created_at
      FROM products
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderClause}
    `;

    const result = await query(sql, values);
    return result.rows;
  },

  /**
   * Busca un producto por ID (solo activos para clientes)
   * @param {number} id
   * @param {boolean} includeInactive - para uso admin
   */
  async findById(id, includeInactive = false) {
    const condition = includeInactive ? 'id = $1' : 'id = $1 AND is_active = true';
    const result = await query(
      `SELECT * FROM products WHERE ${condition} LIMIT 1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Crea un nuevo producto
   */
  async create({ name, description, price, stock, category, image_url }) {
    const result = await query(
      `INSERT INTO products (name, description, price, stock, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || null, price, stock || 0, category, image_url || null]
    );
    return result.rows[0];
  },

  /**
   * Actualiza un producto existente
   */
  async update(id, { name, description, price, stock, category, image_url, is_active }) {
    const result = await query(
      `UPDATE products
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           price       = COALESCE($3, price),
           stock       = COALESCE($4, stock),
           category    = COALESCE($5, category),
           image_url   = COALESCE($6, image_url),
           is_active   = COALESCE($7, is_active)
       WHERE id = $8
       RETURNING *`,
      [name, description, price, stock, category, image_url, is_active, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Elimina un producto (soft delete — marca is_active = false)
   */
  async softDelete(id) {
    const result = await query(
      `UPDATE products SET is_active = false WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Lista todos los productos para el admin (incluye inactivos)
   */
  async findAllAdmin() {
    const result = await query(
      `SELECT * FROM products ORDER BY created_at DESC`
    );
    return result.rows;
  },
};

module.exports = ProductModel;
