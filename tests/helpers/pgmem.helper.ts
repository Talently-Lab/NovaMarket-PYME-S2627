/**
 * Helper de pg-mem para tests de integración — NovaMarket PYME
 *
 * Estrategia: jest.mock('../../backend/src/config/db', () => require('../helpers/pgmem.helper'))
 * Todos los modelos (UserModel, ProductModel, OrderModel, CouponModel)
 * importan query y pool desde db.js — este helper los reemplaza con pg-mem.
 *
 * Limitaciones conocidas de pg-mem v3:
 * - No soporta GENERATED ALWAYS AS STORED → subtotal es columna normal
 * - No soporta triggers plpgsql → updated_at no se actualiza automáticamente
 * - No soporta TIMESTAMP WITH TIME ZONE → se usa TIMESTAMP
 * - json_agg + json_build_object tiene soporte parcial → se simplifica en los tests
 */

import { newDb, DataType } from 'pg-mem';
import bcrypt from 'bcryptjs';

// ── Instancia única de pg-mem para toda la suite ──────────────────────────────
const db = newDb();

// Registrar tipos adicionales que pg-mem no tiene por defecto
db.public.registerFunction({
  name: 'now',
  returns: DataType.text,
  implementation: () => new Date().toISOString(),
});

// ── Schema — espejo del esquema real sin triggers ni columnas generated ────────
db.public.none(`
  CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'customer',
    reset_token         VARCHAR(64)  DEFAULT NULL,
    reset_token_expires TIMESTAMP    DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    description TEXT         DEFAULT NULL,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    category    VARCHAR(100) NOT NULL,
    image_url   TEXT DEFAULT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id),
    status           VARCHAR(20)   NOT NULL DEFAULT 'pending',
    total            NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_name    VARCHAR(150)  DEFAULT NULL,
    shipping_address TEXT          DEFAULT NULL,
    shipping_city    VARCHAR(100)  DEFAULT NULL,
    shipping_phone   VARCHAR(30)   DEFAULT NULL,
    notes            TEXT          DEFAULT NULL,
    payment_method   VARCHAR(30)   DEFAULT 'tarjeta',
    card_last4       VARCHAR(4)    DEFAULT NULL,
    card_brand       VARCHAR(30)   DEFAULT NULL,
    card_type        VARCHAR(10)   DEFAULT NULL,
    installments     INTEGER       DEFAULT 1,
    coupon_code      VARCHAR(30)   DEFAULT NULL,
    discount_amount  NUMERIC(10,2) DEFAULT 0,
    tax_amount       NUMERIC(10,2) DEFAULT 0,
    total_with_tax   NUMERIC(10,2) DEFAULT NULL,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER       NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    subtotal   NUMERIC(10,2) NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id               SERIAL PRIMARY KEY,
    code             VARCHAR(30)   NOT NULL UNIQUE,
    discount_percent NUMERIC(5,2)  NOT NULL DEFAULT 10,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
  );
`);

// ── Adapter pg compatible ─────────────────────────────────────────────────────
const adapter = db.adapters.createPg();
const { Pool } = adapter;
const pool = new Pool();

// Función query directa (usada por UserModel, ProductModel, CouponModel)
const query = (text: string, params?: any[]) => pool.query(text, params);

// connectDB no-op para tests
const connectDB = async () => {};

// ── Seed helpers ──────────────────────────────────────────────────────────────

/**
 * Limpia todas las tablas en orden correcto (FK safe)
 */
async function resetDB() {  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM coupons');
  await pool.query('DELETE FROM users');
}

/**
 * Inserta un usuario de prueba y devuelve el registro creado
 */
async function seedUser({
  name = 'Test User',
  email = 'test@novamarket.test',
  password = 'TestPass123!',
  role = 'customer',
}: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
} = {}) {
  const hashed = await bcrypt.hash(password, 4); // saltRounds=4 para velocidad en tests
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, hashed, role]
  );
  return { ...result.rows[0], rawPassword: password };
}

/**
 * Inserta un producto de prueba y devuelve el registro creado
 */
async function seedProduct({
  name = 'Producto Test',
  price = 10000,
  stock = 10,
  category = 'Gadgets',
  description = 'Descripción de prueba',
  is_active = true,
}: {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  description?: string;
  is_active?: boolean;
} = {}) {
  const result = await pool.query(
    `INSERT INTO products (name, price, stock, category, description, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, price, stock, category, description, is_active]
  );
  return result.rows[0];
}

/**
 * Inserta un cupón de prueba
 */
async function seedCoupon({
  code = 'TEST10',
  discount_percent = 10,
  is_active = true,
}: {
  code?: string;
  discount_percent?: number;
  is_active?: boolean;
} = {}) {
  const result = await pool.query(
    `INSERT INTO coupons (code, discount_percent, is_active)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [code, discount_percent, is_active]
  );
  return result.rows[0];
}

// ── Exports compatibles con db.js (CommonJS) ─────────────────────────────────
module.exports = { pool, query, connectDB, resetDB, seedUser, seedProduct, seedCoupon };
