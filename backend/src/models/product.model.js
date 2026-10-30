const { query } = require('../config/db');

/**
 * Modelo de Producto
 * Todas las operaciones SQL sobre la tabla `products`
 */

const ProductModel = {
  /**
   * Lista todos los productos activos con filtros y paginación opcionales
   * @param {Object} filters - { category, minPrice, maxPrice, order, page, limit }
   * @returns {{ rows: Array, total: number }}
   */
  async findAll({ category, minPrice, maxPrice, order, page, limit, search } = {}) {
    const conditions = ['is_active = true'];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

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
      'created_at DESC';

    const whereClause = conditions.join(' AND ');

    // Total sin paginación (para que el frontend pueda calcular páginas)
    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM products WHERE ${whereClause}`,
      values
    );
    const total = countResult.rows[0].total;

    // Paginación — si no se pasa page/limit, trae todo
    const pageNum  = parseInt(page)  || null;
    const limitNum = parseInt(limit) || null;

    let paginationClause = '';
    if (pageNum && limitNum) {
      const offset = (pageNum - 1) * limitNum;
      paginationClause = ` LIMIT $${idx++} OFFSET $${idx++}`;
      values.push(limitNum, offset);
    }

    const sql = `
      SELECT id, name, description, price, stock, category, image_url, created_at
      FROM products
      WHERE ${whereClause}
      ORDER BY ${orderClause}${paginationClause}
    `;

    const result = await query(sql, values);
    return { rows: result.rows, total };
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
  /**
   * Lista categorías únicas con conteo de productos (admin)
   */
  async getCategories() {
    const result = await query(
      `SELECT category,
              COUNT(*)::int        AS product_count,
              COUNT(*) FILTER (WHERE is_active = true AND stock > 0)::int AS active_count
       FROM products
       WHERE category IS NOT NULL
       GROUP BY category
       ORDER BY category ASC`
    );
    return result.rows;
  },

  /**
   * Renombra una categoría en todos los productos que la tienen
   */
  async renameCategory(oldName, newName) {
    const result = await query(
      `UPDATE products SET category = $1 WHERE category ILIKE $2 RETURNING id`,
      [newName, oldName]
    );
    return result.rowCount;
  },

};

module.exports = ProductModel;
