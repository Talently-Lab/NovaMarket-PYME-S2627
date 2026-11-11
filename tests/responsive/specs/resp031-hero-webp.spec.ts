/**
 * SPEC: RESP-031 — Imagen hero WebP + srcset (regresión)
 *
 * Verifica que:
 * 1. El <picture> con <source type="image/webp"> existe en el DOM
 * 2. Los 4 archivos WebP son accesibles (HTTP 200 / 304)
 * 3. El <img> tiene width, height y fetchpriority="high"
 * 4. No hay petición HTTP al PNG original de 1767 KB desde Chromium
 *    (Chromium prefiere WebP cuando hay <source type="image/webp">)
 *
 * Test de regresión: si fallaba antes del fix (imagen PNG cargada),
 * ahora debe pasar (imagen WebP + atributos LCP correctos).
 */
import { test, expect } from '@playwright/test';
import { auditScreenshot, waitForAnimations } from '../helpers/responsive.helpers';

const WEBP_VARIANTS = [
  '/images/hero-480w.webp',
  '/images/hero-960w.webp',
  '/images/hero-1440w.webp',
  '/images/hero-1914w.webp',
];

test('[RESP-031] Hero — <picture> con source WebP presente en DOM', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForAnimations(page);
  await auditScreenshot(page, 'resp031', `hero-webp-${page.viewportSize()?.width}`);

  // Verificar que existe el elemento <picture>
  const picture = page.locator('.hero-figma picture');
  await expect(picture, 'Debe existir <picture> dentro del hero').toHaveCount(1);

  // Verificar <source type="image/webp"> con srcset
  const source = page.locator('.hero-figma picture source[type="image/webp"]');
  await expect(source, '<source type="image/webp"> debe existir').toHaveCount(1);
  const srcset = await source.getAttribute('srcset');
  expect(srcset, 'srcset debe contener rutas WebP').toContain('.webp');

  // Verificar que el <img> tiene width, height, fetchpriority
  const img = page.locator('.hero-figma picture img');
  await expect(img).toHaveCount(1);
  const width  = await img.getAttribute('width');
  const height = await img.getAttribute('height');
  const fetchp = await img.getAttribute('fetchpriority');
  expect(width,  'img debe tener atributo width').toBe('1914');
  expect(height, 'img debe tener atributo height').toBe('822');
  expect(fetchp, 'img debe tener fetchpriority="high"').toBe('high');
});

test('[RESP-031] Hero — variantes WebP accesibles (HTTP 200/304)', async ({ page }) => {
  const baseURL = page.context().browser()?.contexts()[0]?.pages()[0]
    ? undefined
    : undefined;

  // Usar la baseURL configurada en Playwright
  for (const path of WEBP_VARIANTS) {
    const response = await page.request.get(path);
    expect(
      response.status(),
      `${path} debe retornar 200 o 304, obtuvo ${response.status()}`
    ).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(400);
  }
});

test('[RESP-031] Hero — Chromium carga WebP, no el PNG de 1767 KB', async ({ page }) => {
  // Interceptar todas las peticiones de imagen para verificar que no carga el PNG grande
  const loadedImages: string[] = [];

  page.on('response', (response) => {
    const url = response.url();
    if (
      (url.endsWith('.png') || url.endsWith('.webp') || url.endsWith('.jpg')) &&
      url.includes('/images/')
    ) {
      loadedImages.push(url);
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  const heroPNG = loadedImages.find(url =>
    url.includes('Estaci') || url.includes('gamer') || url.includes('ne%C3%B3n')
  );
  const heroWebP = loadedImages.find(url => url.includes('hero-') && url.endsWith('.webp'));

  console.log('[RESP-031] Imágenes cargadas desde /images/:', loadedImages);
  console.log('[RESP-031] PNG hero cargado:', heroPNG ?? 'NO (correcto)');
  console.log('[RESP-031] WebP hero cargado:', heroWebP ?? 'NO (inesperado)');

  // En Chromium (soporte WebP nativo), el PNG fallback NO debe cargarse
  expect(
    heroPNG,
    'Chromium no debe cargar el PNG de 1767 KB cuando hay <source type="image/webp">'
  ).toBeUndefined();

  expect(
    heroWebP,
    'Debe cargarse alguna variante WebP del hero'
  ).toBeTruthy();

  await auditScreenshot(page, 'resp031', `after-webp-network-${page.viewportSize()?.width}`);
});
