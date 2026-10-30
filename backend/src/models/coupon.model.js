const { query } = require('../config/db');

/**
 * Modelo de cupones de descuento.
 * Reemplaza el objeto in-memory VALID_COUPONS de order.controller.js.
 */

/**
 * Busca un cupón activo por código (case-insensitive).
 * @returns {Object|null} { id, code, discount_percent } o null si no existe/inactivo
 */
async function findByCode(code) {
  const normalized = code.toUpperCase().trim();
  const result = await query(
    `SELECT id, code, discount_percent
     FROM coupons
     WHERE code = $1 AND is_active = true
     LIMIT 1`,
    [normalized]
  );
  return result.rows[0] || null;
}

/**
 * Lista todos los cupones activos.
 * @returns {Array} [{ id, code, discount_percent, created_at }]
 */
async function findAll() {
  const result = await query(
    `SELECT id, code, discount_percent, is_active, created_at
     FROM coupons
     ORDER BY created_at DESC`
  );
  return result.rows;
}

/**
 * Crea un nuevo cupón.
 * @returns {Object} cupón creado
 */
async function create(code, discount_percent) {
  const normalized = code.toUpperCase().trim().replace(/\s/g, '');
  const result = await query(
    `INSERT INTO coupons (code, discount_percent)
     VALUES ($1, $2)
     RETURNING id, code, discount_percent`,
    [normalized, discount_percent]
  );
  return result.rows[0];
}

/**
 * Desactiva un cupón por código (soft delete).
 * @returns {Object|null} cupón desactivado o null si no existía
 */
async function deactivate(code) {
  const normalized = code.toUpperCase().trim();
  const result = await query(
    `UPDATE coupons
     SET is_active = false, updated_at = NOW()
     WHERE code = $1
     RETURNING id, code, discount_percent`,
    [normalized]
  );
  return result.rows[0] || null;
}

/**
 * Verifica si un código ya existe (activo o inactivo).
 * @returns {boolean}
 */
async function existsByCode(code) {
  const normalized = code.toUpperCase().trim();
  const result = await query(
    `SELECT 1 FROM coupons WHERE code = $1 LIMIT 1`,
    [normalized]
  );
  return result.rows.length > 0;
}

module.exports = { findByCode, findAll, create, deactivate, existsByCode };
