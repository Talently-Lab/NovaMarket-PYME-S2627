const { query } = require('../config/db');

/**
 * Modelo de Usuario
 * Todas las operaciones SQL sobre la tabla `users`
 */

const UserModel = {
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create(name, email, hashedPassword, role = 'customer') {
    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  },

  /**
   * Lista todos los usuarios — solo para admin
   * @returns {Array} lista de usuarios (sin password)
   */
  async findAll() {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COUNT(o.id)::int AS order_count
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  },

  async updatePassword(userId, hashedPassword) {
    const result = await query(
      `UPDATE users SET password = $1 WHERE id = $2
       RETURNING id, name, email, role`,
      [hashedPassword, userId]
    );
    return result.rows[0] || null;
  },

  async setResetToken(email, token, expires) {
    const result = await query(
      `UPDATE users SET reset_token = $1, reset_token_expires = $2
       WHERE email = $3
       RETURNING id, email`,
      [token, expires, email]
    );
    return result.rows[0] || null;
  },

  async findByResetToken(token) {
    const result = await query(
      `SELECT id, email, name, reset_token_expires
       FROM users
       WHERE reset_token = $1 LIMIT 1`,
      [token]
    );
    return result.rows[0] || null;
  },

  async clearResetToken(userId) {
    await query(
      `UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1`,
      [userId]
    );
  },
};

module.exports = UserModel;
