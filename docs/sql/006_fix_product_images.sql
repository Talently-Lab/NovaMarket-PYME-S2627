-- ============================================================
-- NovaMarket — Fix 006
-- Corrección de imágenes de productos
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 25/sep/2026
-- ============================================================

-- Productos originales (1-8)
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80' WHERE id = 1; -- Mouse Gamer
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1595225476474-87563907ef6f?w=600&q=80' WHERE id = 2; -- Teclado Mecánico
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' WHERE id = 3; -- Auriculares
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80' WHERE id = 4; -- Mousepad
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80' WHERE id = 5; -- Webcam
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=600&q=80' WHERE id = 6; -- Hub USB-C
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80' WHERE id = 7; -- Monitor
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&q=80' WHERE id = 8; -- Silla Gamer

-- Productos adicionales (9-20)
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80' WHERE id = 9;  -- Headset Logitech G435
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1616763355603-9755a912a93a?w=600&q=80' WHERE id = 10; -- Mousepad RGB XL
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80' WHERE id = 11; -- Teclado MX Keys
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1593640408182-31c228e50b00?w=600&q=80' WHERE id = 12; -- Soporte Monitor Doble
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600&q=80' WHERE id = 13; -- Micrófono Blue Yeti
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1580481072645-022349e587d1?w=600&q=80' WHERE id = 14; -- Luz LED RGB
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80' WHERE id = 15; -- Control Xbox
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' WHERE id = 16; -- Tira LED RGB
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600&q=80' WHERE id = 17; -- SSD Samsung T7
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=600&q=80' WHERE id = 18; -- Soporte Auriculares
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80' WHERE id = 19; -- Cámara 4K Brio
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' WHERE id = 20; -- Switch KVM
