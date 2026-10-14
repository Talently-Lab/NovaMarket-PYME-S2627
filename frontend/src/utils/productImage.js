/**
 * Imagenes de productos — servidas localmente desde /public/images/Productos/
 * Estructura: /images/Productos/{categoria}/{n}.webp
 */
const PRODUCT_IMAGES = {
  'Mouse Gamer Logitech G203':            '/images/Productos/perifericos/1.webp',
  'Teclado Mecánico Redragon K552':       '/images/Productos/perifericos/2.webp',
  'Mouse Pad RGB XL Redragon':            '/images/Productos/perifericos/3.webp',
  'Teclado Inalámbrico Logitech MX Keys': '/images/Productos/perifericos/4.webp',
  'Webcam Logitech C920 HD Pro':          '/images/Productos/perifericos/5.webp',
  'Soporte para Monitor Doble':           '/images/Productos/perifericos/6.webp',
  'Auriculares HyperX Cloud II':          '/images/Productos/audio/1.webp',
  'Headset Gamer Logitech G435':          '/images/Productos/audio/2.webp',
  'Micrófono USB Blue Yeti':              '/images/Productos/audio/3.webp',
  'Soporte para Auriculares RGB':         '/images/Productos/audio/4.webp',
  'Cámara Web 4K Logitech Brio':          '/images/Productos/audio/5.webp',
  'Mousepad XL Speed Negra':              '/images/Productos/gaming/1.webp',
  'Monitor Gaming 24" 144Hz':             '/images/Productos/gaming/2.webp',
  'Silla Gamer Pro RGB':                  '/images/Productos/gaming/3.webp',
  'Control Gamepad Xbox Series':          '/images/Productos/gaming/4.webp',
  'Tira LED RGB 5 metros':                '/images/Productos/gaming/5.webp',
  'Hub USB-C 7 en 1':                     '/images/Productos/Gadgets/1.webp',
  'SSD Externo Samsung T7 1TB':           '/images/Productos/Gadgets/2.webp',
  'Switch KVM HDMI 4K 2 Puertos':         '/images/Productos/Gadgets/3.webp',
  'Luz LED de Escritorio RGB':            '/images/Productos/Gadgets/4.webp',
};

const CATEGORY_IMAGES = {
  'Periféricos': '/images/Productos/perifericos/1.webp',
  'Audio':       '/images/Productos/audio/1.webp',
  'Gaming':      '/images/Productos/gaming/1.webp',
  'Gadgets':     '/images/Productos/Gadgets/1.webp',
  'Accesorios':  '/images/Productos/perifericos/1.webp',
  'Notebooks':   '/images/Productos/notebooks/1.webp',
  'Celulares':   '/images/Productos/cel/1.webp',
};

const DEFAULT_IMAGE = '/images/Productos/Gadgets/1.webp';

export function getProductImage(product) {
  if (product.image_url && !product.image_url.includes('unsplash')) {
    return product.image_url;
  }
  return PRODUCT_IMAGES[product.name] || CATEGORY_IMAGES[product.category] || DEFAULT_IMAGE;
}
