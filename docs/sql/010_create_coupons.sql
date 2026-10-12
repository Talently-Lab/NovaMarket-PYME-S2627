-- =============================================================================
-- Migración 010 — Tabla de cupones de descuento
-- Reemplaza los cupones hardcodeados en order.controller.js
-- Ejecutar en: Supabase SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id               SERIAL PRIMARY KEY,
  code             VARCHAR(30)    NOT NULL UNIQUE,
  discount_percent NUMERIC(5,2)   NOT NULL CHECK (discount_percent > 0 AND discount_percent < 100),
  is_active        BOOLEAN        NOT NULL DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda por código (se usa en cada checkout)
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);

-- Trigger para updated_at automático
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed: cupones iniciales (equivalentes a los hardcodeados)
INSERT INTO coupons (code, discount_percent) VALUES
  ('NOVA10',   10),
  ('NOVA20',   20),
  ('GAMING15', 15),
  ('PROMO5',    5)
ON CONFLICT (code) DO NOTHING;
