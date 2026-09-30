-- ============================================================
-- NovaMarket — Fix 007
-- Corrección de imágenes que no corresponden al producto
-- Ejecutar DESPUÉS de 006_fix_product_images.sql
-- Fecha: 25/sep/2026
-- ============================================================

-- Webcam Logitech C920 (id=5) — foto de webcam real
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=600&q=80' WHERE id = 5;

-- Hub USB-C 7 en 1 (id=6) — foto de hub/adaptador
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1619953942547-233ac450897e?w=600&q=80' WHERE id = 6;

-- Teclado Mecánico Redragon K552 (id=2) — teclado mecánico negro
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80' WHERE id = 2;

-- Mousepad XL Speed Negra (id=4) — mousepad de escritorio
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1612487439139-c2f7232ee2de?w=600&q=80' WHERE id = 4;

-- Luz LED de Escritorio RGB (id=14) — lámpara de escritorio
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80' WHERE id = 14;

-- Mouse Pad RGB XL Redragon (id=10) — mousepad gaming RGB
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1612487439139-c2f7232ee2de?w=600&q=80' WHERE id = 10;

-- Soporte para Monitor Doble (id=12) — monitor en escritorio
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80' WHERE id = 12;

-- Headset Logitech G435 (id=9) — headset gaming over-ear
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80' WHERE id = 9;

-- Soporte para Auriculares RGB (id=18) — soporte headset escritorio
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=600&q=80' WHERE id = 18;

-- Switch KVM HDMI (id=20) — cables/conectores tech
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' WHERE id = 20;
