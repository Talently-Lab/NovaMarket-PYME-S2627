/**
 * Imagenes de productos — servidas localmente desde /public/images/Productos/
 * Estructura: /images/Productos/{categoria}/{n}.webp
 *
 * Orden de resolución:
 * 1. image_url en BD (si no es Unsplash ni MercadoLibre)
 * 2. Mapeo exacto por nombre
 * 3. Fallback por categoría
 * 4. Imagen por defecto
 */
const PRODUCT_IMAGES = {
  // Periféricos
  'Mouse Gamer Logitech G203':            '/images/Productos/perifericos/1.webp',
  'Teclado Mecánico Redragon K552':       '/images/Productos/perifericos/2.webp',
  'Mouse Pad RGB XL Redragon':            '/images/Productos/perifericos/3.webp',
  'Teclado Inalámbrico Logitech MX Keys': '/images/Productos/perifericos/4.webp',
  'Soporte para Monitor Doble':           '/images/Productos/perifericos/5.webp',
  // Audio
  'Auriculares HyperX Cloud II':          '/images/Productos/audio/1.webp',
  'Headset Gamer Logitech G435':          '/images/Productos/audio/2.webp',
  'Micrófono USB Blue Yeti':              '/images/Productos/audio/3.webp',
  'Soporte para Auriculares RGB':         '/images/Productos/audio/4.webp',
  // Gaming
  'Mousepad XL Speed Negra':              '/images/Productos/gaming/1.webp',
  'Monitor Gaming 24" 144Hz':             '/images/Productos/gaming/2.webp',
  'Silla Gamer Pro RGB':                  '/images/Productos/gaming/3.webp',
  'Control Gamepad Xbox Series':          '/images/Productos/gaming/4.webp',
  'Tira LED RGB 5 metros':                '/images/Productos/gaming/5.webp',
  // Gadgets
  'Hub USB-C 7 en 1':                     '/images/Productos/Gadgets/1.webp',
  'SSD Externo Samsung T7 1TB':           '/images/Productos/Gadgets/2.webp',
  'Switch KVM HDMI 4K 2 Puertos':         '/images/Productos/Gadgets/3.webp',
  'Webcam Logitech C920 HD Pro':          '/images/Productos/Gadgets/4.webp',
  'Cámara Web 4K Logitech Brio':          '/images/Productos/Gadgets/5.webp',
  'Luz LED de Escritorio RGB':            '/images/Productos/Gadgets/6.webp',
  // Celulares
  'Samsung Galaxy A55 5G':               '/images/Productos/cel/1.webp',
  'iPhone 15 128GB':                     '/images/Productos/cel/2.webp',
  'Motorola Edge 40 Neo':                '/images/Productos/cel/3.webp',
  'Xiaomi Redmi Note 13 Pro':            '/images/Productos/cel/4.webp',
  'Samsung Galaxy S24 FE':               '/images/Productos/cel/5.webp',
  // Notebooks
  'MacBook Air M3 13"':                  '/images/Productos/notebooks/1.webp',
  'ASUS VivoBook 15 OLED':               '/images/Productos/notebooks/2.webp',
  'Lenovo IdeaPad Slim 5':               '/images/Productos/notebooks/3.webp',
  'HP Pavilion 15 Gaming':               '/images/Productos/notebooks/4.webp',
  'Dell Inspiron 14 Plus':               '/images/Productos/notebooks/5.webp',
};

const CATEGORY_IMAGES = {
  'Periféricos':  '/images/Productos/perifericos/1.webp',
  'Teclados':     '/images/Productos/perifericos/2.webp',
  'Audio':        '/images/Productos/audio/1.webp',
  'Gaming':       '/images/Productos/gaming/1.webp',
  'Gadgets':      '/images/Productos/Gadgets/1.webp',
  'Accesorios':   '/images/Productos/perifericos/3.webp',
  'Iluminación':  '/images/Productos/gaming/5.webp',
  'Monitores':    '/images/Productos/gaming/2.webp',
  'Notebooks':    '/images/Productos/notebooks/1.webp',
  'Celulares':    '/images/Productos/cel/1.webp',
};

const DEFAULT_IMAGE = '/images/Productos/Gadgets/1.webp';

// URLs externas que deben ignorarse y reemplazarse por imágenes locales
const BLOCKED_HOSTS = ['unsplash.com', 'mlstatic.com'];

export function getProductImage(product) {
  const url = product?.image_url;
  if (url && !BLOCKED_HOSTS.some(h => url.includes(h))) {
    return url;
  }
  return PRODUCT_IMAGES[product?.name] || CATEGORY_IMAGES[product?.category] || DEFAULT_IMAGE;
}

/**
 * Devuelve un array de hasta 5 URLs de imágenes del producto.
 * El campo image_url puede contener múltiples URLs separadas por '|||'.
 * La primera siempre es la imagen principal.
 * Si no hay imágenes extras, devuelve solo la principal.
 */
export function getProductImages(product) {
  const url = product?.image_url ?? '';
  const SEPARATOR = '|||';

  // Extraer todas las URLs del campo image_url
  let urls = url.split(SEPARATOR).map(u => u.trim()).filter(Boolean);

  // Filtrar URLs externas bloqueadas una a una
  urls = urls.map(u =>
    BLOCKED_HOSTS.some(h => u.includes(h))
      ? (PRODUCT_IMAGES[product?.name] || CATEGORY_IMAGES[product?.category] || DEFAULT_IMAGE)
      : u
  );

  // Si no hay ninguna URL válida, usar la imagen por nombre/categoría
  if (urls.length === 0) {
    const fallback = PRODUCT_IMAGES[product?.name] || CATEGORY_IMAGES[product?.category] || DEFAULT_IMAGE;
    urls = [fallback];
  }

  return urls;
}
