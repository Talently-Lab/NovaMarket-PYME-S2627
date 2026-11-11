-- ============================================================
-- NovaMarket — Migración 003
-- Tablas: orders + order_items
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 24/sep/2026
-- ============================================================

-- Tabla principal de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER               NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status        VARCHAR(20)           NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total         NUMERIC(10, 2)        NOT NULL CHECK (total >= 0),
  -- Datos de envío (snapshot al momento del checkout)
  shipping_name     VARCHAR(150),
  shipping_address  TEXT,
  shipping_city     VARCHAR(100),
  shipping_phone    VARCHAR(30),
  notes             TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detalle de productos por pedido
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER               NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER               NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity      INTEGER               NOT NULL CHECK (quantity > 0),
  -- Snapshot del precio al momento de la compra
  unit_price    NUMERIC(10, 2)        NOT NULL CHECK (unit_price >= 0),
  subtotal      NUMERIC(10, 2)        GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orders_user_id  ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Trigger updated_at en orders
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
