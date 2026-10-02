-- ============================================================
-- NovaMarket — Migración 008
-- Agrega campos de pago a la tabla orders
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2/oct/2026
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method   VARCHAR(30)   DEFAULT 'tarjeta',
  ADD COLUMN IF NOT EXISTS card_last4       VARCHAR(4)    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_brand       VARCHAR(30)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_type        VARCHAR(10)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS installments     INTEGER       DEFAULT 1,
  ADD COLUMN IF NOT EXISTS coupon_code      VARCHAR(30)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_amount  NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount       NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_with_tax   NUMERIC(10,2) DEFAULT NULL;

-- Retrocompatibilidad: rellenar total_with_tax en pedidos existentes
UPDATE orders SET total_with_tax = total WHERE total_with_tax IS NULL;
