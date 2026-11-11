-- ══════════════════════════════════════════════════════════════
-- 011_seed_celulares_notebooks.sql
-- Agrega 5 celulares + 5 notebooks con imagenes locales
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

INSERT INTO products (id, name, description, price, stock, category, image_url, is_active) VALUES

-- ── CELULARES ────────────────────────────────────────────────
(26,
 'Samsung Galaxy A55 5G',
 'Smartphone 5G con pantalla Super AMOLED 6.6", cámara triple 50MP, 8GB RAM, 128GB almacenamiento, batería 5000mAh y carga rápida 25W.',
 549999, 15, 'Celulares',
 '/images/Productos/cel/1.webp', true),

(27,
 'iPhone 15 128GB',
 'Smartphone Apple con chip A16 Bionic, pantalla Super Retina XDR 6.1", sistema de cámara dual 48MP, Dynamic Island y carga USB-C.',
 1199999, 8, 'Celulares',
 '/images/Productos/cel/2.webp', true),

(28,
 'Motorola Edge 40 Neo',
 'Smartphone con pantalla pOLED 6.55" 144Hz, cámara 50MP con OIS, batería 5000mAh con TurboPower 68W y protección IP68.',
 389999, 20, 'Celulares',
 '/images/Productos/cel/3.webp', true),

(29,
 'Xiaomi Redmi Note 13 Pro',
 'Smartphone con cámara de 200MP, pantalla AMOLED 6.67" 120Hz, 8GB RAM, 256GB, batería 5100mAh y carga 67W.',
 299999, 25, 'Celulares',
 '/images/Productos/cel/4.webp', true),

(30,
 'Samsung Galaxy S24 FE',
 'Smartphone Fan Edition con Inteligencia Artificial Galaxy AI, pantalla Dynamic AMOLED 6.7", cámara 50MP y chip Exynos 2500.',
 749999, 10, 'Celulares',
 '/images/Productos/cel/5.webp', true),

-- ── NOTEBOOKS ────────────────────────────────────────────────
(31,
 'MacBook Air M3 13"',
 'Notebook ultradelgada con chip Apple M3, pantalla Liquid Retina 13.6", 8GB RAM unificada, 256GB SSD y hasta 18hs de batería.',
 1899999, 6, 'Notebooks',
 '/images/Productos/notebooks/1.webp', true),

(32,
 'ASUS VivoBook 15 OLED',
 'Notebook con pantalla OLED 15.6" FHD, Intel Core i5-13500H, 16GB RAM, 512GB SSD NVMe, gráficos Intel Iris Xe y teclado retroiluminado.',
 799999, 12, 'Notebooks',
 '/images/Productos/notebooks/2.webp', true),

(33,
 'Lenovo IdeaPad Slim 5',
 'Notebook delgada con AMD Ryzen 7 7730U, pantalla IPS 16" 60Hz, 16GB RAM, 512GB SSD, Windows 11 y autonomía de 12hs.',
 699999, 14, 'Notebooks',
 '/images/Productos/notebooks/3.webp', true),

(34,
 'HP Pavilion 15 Gaming',
 'Notebook gaming con Intel Core i5-13420H, NVIDIA GeForce RTX 3050 4GB, 16GB RAM, 512GB SSD, pantalla FHD 144Hz.',
 949999, 9, 'Notebooks',
 '/images/Productos/notebooks/4.webp', true),

(35,
 'Dell Inspiron 14 Plus',
 'Notebook premium con Intel Core Ultra 5, pantalla QHD+ 14" 120Hz, 16GB LPDDR5, 512GB SSD, diseño compacto 1.58kg.',
 1099999, 7, 'Notebooks',
 '/images/Productos/notebooks/5.webp', true)

ON CONFLICT (id) DO NOTHING;
