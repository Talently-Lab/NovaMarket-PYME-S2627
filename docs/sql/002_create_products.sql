-- ============================================================
-- NovaMarket — Migración 002
-- Tabla: products
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 24/sep/2026
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200)          NOT NULL,
  description   TEXT,
  price         NUMERIC(10, 2)        NOT NULL CHECK (price >= 0),
  stock         INTEGER               NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category      VARCHAR(100)          NOT NULL,
  image_url     TEXT,
  is_active     BOOLEAN               NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Datos de prueba (opcional — descomentar para seed)
-- ============================================================
-- INSERT INTO products (name, description, price, stock, category, image_url) VALUES
--   ('Mouse Gamer Logitech G203', 'Mouse con iluminación RGB y 8000 DPI', 29999.00, 15, 'Periféricos', NULL),
--   ('Teclado Mecánico Redragon K552', 'Teclado mecánico con switches azules', 49999.00, 8, 'Teclados', NULL),
--   ('Auriculares HyperX Cloud II', 'Auriculares gaming con sonido surround 7.1', 89999.00, 5, 'Audio', NULL),
--   ('Mousepad XL Speed', 'Mousepad extra grande 900x400mm', 14999.00, 20, 'Accesorios', NULL);
