const { query } = require('../config/db');

/**
 * Modelo de Usuario
 * Todas las operaciones SQL sobre la tabla `users`
 */

const UserModel = {
  /**
   * Busca un usuario por email
   * @param {string} email
   * @returns {Object|null} usuario o null
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Busca un usuario por ID
   * @param {number} id
   * @returns {Object|null} usuario o null
   */
  async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Crea un nuevo usuario
   * @param {string} name
   * @param {string} email
   * @param {string} hashedPassword
   * @param {string} role - 'customer' | 'admin'
   * @returns {Object} usuario creado (sin password)
   */
  async create(name, email, hashedPassword, role = 'customer') {
    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  },
};

module.exports = UserModel;
