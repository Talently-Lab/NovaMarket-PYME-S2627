/**
 * Imágenes de productos usando picsum.photos
 * IDs verificados y estables — no requieren API key ni dependen de Unsplash
 */
const PRODUCT_IMAGES = {
  'Mouse Gamer Logitech G203':            'https://picsum.photos/seed/mouse-gamer/600/400',
  'Teclado Mecánico Redragon K552':       'https://picsum.photos/seed/teclado-mec/600/400',
  'Auriculares HyperX Cloud II':          'https://picsum.photos/seed/auriculares/600/400',
  'Mousepad XL Speed Negra':              'https://picsum.photos/seed/mousepad-xl/600/400',
  'Webcam Logitech C920 HD Pro':          'https://picsum.photos/seed/webcam-c920/600/400',
  'Hub USB-C 7 en 1':                     'https://picsum.photos/seed/hub-usbc/600/400',
  'Monitor Gaming 24" 144Hz':             'https://picsum.photos/seed/monitor-24/600/400',
  'Silla Gamer Pro RGB':                  'https://picsum.photos/seed/silla-gamer/600/400',
  'Headset Gamer Logitech G435':          'https://picsum.photos/seed/headset-g435/600/400',
  'Mouse Pad RGB XL Redragon':            'https://picsum.photos/seed/mousepad-rgb/600/400',
  'Teclado Inalámbrico Logitech MX Keys': 'https://picsum.photos/seed/teclado-mx/600/400',
  'Soporte para Monitor Doble':           'https://picsum.photos/seed/soporte-monitor/600/400',
  'Micrófono USB Blue Yeti':              'https://picsum.photos/seed/microfono-yeti/600/400',
  'Luz LED de Escritorio RGB':            'https://picsum.photos/seed/luz-led/600/400',
  'Control Gamepad Xbox Series':          'https://picsum.photos/seed/gamepad-xbox/600/400',
  'Tira LED RGB 5 metros':                'https://picsum.photos/seed/tira-led/600/400',
  'SSD Externo Samsung T7 1TB':           'https://picsum.photos/seed/ssd-samsung/600/400',
  'Soporte para Auriculares RGB':         'https://picsum.photos/seed/soporte-auricular/600/400',
  'Cámara Web 4K Logitech Brio':          'https://picsum.photos/seed/camara-brio/600/400',
  'Switch KVM HDMI 4K 2 Puertos':         'https://picsum.photos/seed/switch-kvm/600/400',
};

export function getProductImage(product) {
  return PRODUCT_IMAGES[product.name] || 'https://picsum.photos/seed/tech-product/600/400';
}
