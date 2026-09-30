-- ============================================================
-- NovaMarket — Migración 001
-- Tabla: users
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 24/sep/2026
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100)        NOT NULL,
  email        VARCHAR(150)        NOT NULL UNIQUE,
  password     VARCHAR(255)        NOT NULL,
  role         VARCHAR(20)         NOT NULL DEFAULT 'customer'
                                   CHECK (role IN ('customer', 'admin')),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por email (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Para crear un admin inicial (cambiar los valores):
-- INSERT INTO users (name, email, password, role)
-- VALUES ('Admin NovaMarket', 'admin@novamarket.com', '<hash>', 'admin');
-- ============================================================
