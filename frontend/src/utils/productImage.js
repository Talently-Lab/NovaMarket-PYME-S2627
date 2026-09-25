/**
 * Imágenes de productos — URLs de Unsplash con IDs fijos verificados
 * Formato: /photo-{ID}?w=600&q=80 — estable y sin redirecciones
 */
const PRODUCT_IMAGES = {
  'Mouse Gamer Logitech G203':            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
  'Teclado Mecánico Redragon K552':       'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
  'Auriculares HyperX Cloud II':          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  'Mousepad XL Speed Negra':              'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
  'Webcam Logitech C920 HD Pro':          'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80',
  'Hub USB-C 7 en 1':                     'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=600&q=80',
  'Monitor Gaming 24" 144Hz':             'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
  'Silla Gamer Pro RGB':                  'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&q=80',
  'Headset Gamer Logitech G435':          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
  'Mouse Pad RGB XL Redragon':            'https://images.unsplash.com/photo-1593640408182-31c228e50b00?w=600&q=80',
  'Teclado Inalámbrico Logitech MX Keys': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
  'Soporte para Monitor Doble':           'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80',
  'Micrófono USB Blue Yeti':              'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600&q=80',
  'Luz LED de Escritorio RGB':            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
  'Control Gamepad Xbox Series':          'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80',
  'Tira LED RGB 5 metros':                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'SSD Externo Samsung T7 1TB':           'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600&q=80',
  'Soporte para Auriculares RGB':         'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=600&q=80',
  'Cámara Web 4K Logitech Brio':          'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=600&q=80',
  'Switch KVM HDMI 4K 2 Puertos':         'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
};

// Fallback por categoría — imágenes tech genéricas confiables
const CATEGORY_IMAGES = {
  'Periféricos':  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
  'Teclados':     'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
  'Audio':        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  'Accesorios':   'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=600&q=80',
  'Gadgets':      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  'Monitores':    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
  'Gaming':       'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80',
  'Iluminación':  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
};

export function getProductImage(product) {
  return (
    PRODUCT_IMAGES[product.name] ||
    CATEGORY_IMAGES[product.category] ||
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80'
  );
}
