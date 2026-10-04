-- NovaMarket — Migración 009
-- Agrega columnas para flujo "olvidé mi contraseña"
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: oct/2026
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token         VARCHAR(64)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Índice para búsquedas por token
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)
  WHERE reset_token IS NOT NULL;
