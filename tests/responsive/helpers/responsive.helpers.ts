import { Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/** Directorio donde se guardan las capturas de la auditoría */
export const SCREENSHOTS_DIR = path.resolve(
  __dirname,
  '../../../docs/qa/responsive-audit/screenshots',
);

// Asegurar que el directorio existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Toma una captura y la guarda con un nombre descriptivo.
 * Formato: <pantalla>-<viewport>-<descripcion>.png
 */
export async function auditScreenshot(
  page: Page,
  screenName: string,
  description: string,
): Promise<string> {
  const viewportSize = page.viewportSize();
  const vpLabel = viewportSize
    ? `${viewportSize.width}x${viewportSize.height}`
    : 'unknown';
  const safeName = `${screenName}-${vpLabel}-${description}`
    .replace(/[^a-z0-9-_]/gi, '-')
    .toLowerCase();
  const filePath = path.join(SCREENSHOTS_DIR, `${safeName}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

/**
 * Verifica que NO haya overflow horizontal en la página.
 * scrollWidth > clientWidth indica que hay contenido que desborda.
 *
 * @returns { hasOverflow: boolean, scrollWidth: number, clientWidth: number }
 */
export async function checkHorizontalOverflow(page: Page): Promise<{
  hasOverflow: boolean;
  scrollWidth: number;
  clientWidth: number;
}> {
  const result = await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    return {
      hasOverflow: scrollWidth > clientWidth,
      scrollWidth,
      clientWidth,
    };
  });
  return result;
}

/**
 * Verifica que todos los elementos interactivos visibles tengan
 * un área táctil mínima de minSize × minSize px.
 *
 * @param minSize - tamaño mínimo en px (default 44)
 * @returns Array de elementos con área insuficiente
 */
export async function checkTouchTargets(
  page: Page,
  minSize = 44,
): Promise<Array<{ selector: string; width: number; height: number }>> {
  return page.evaluate((min) => {
    const interactiveSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input[type="checkbox"]',
      'input[type="radio"]',
      '[role="button"]',
      '[role="link"]',
      '[role="switch"]',
    ];

    const results: Array<{ selector: string; width: number; height: number }> = [];

    interactiveSelectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Solo elementos visibles dentro del viewport
        if (
          rect.width === 0 ||
          rect.height === 0 ||
          rect.top < -100 ||
          rect.bottom > window.innerHeight + 100
        )
          return;

        if (rect.width < min || rect.height < min) {
          results.push({
            selector: sel,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      });
    });

    return results;
  }, minSize);
}

/**
 * Verifica que ningún elemento esté parcialmente fuera del viewport
 * (left < 0 o right > window.innerWidth).
 */
export async function checkElementsOutOfViewport(
  page: Page,
): Promise<Array<{ tag: string; text: string; left: number; right: number }>> {
  return page.evaluate(() => {
    const results: Array<{ tag: string; text: string; left: number; right: number }> = [];
    const width = window.innerWidth;

    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (rect.left < -10 || rect.right > width + 10) {
        results.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent ?? '').trim().slice(0, 60),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        });
      }
    });

    return results.slice(0, 20); // limitar a 20 para no saturar el output
  });
}

/**
 * Retorna el valor computado de font-size de todos los inputs visibles.
 * Útil para detectar inputs < 16px que disparan zoom en iOS.
 */
export async function checkInputFontSizes(
  page: Page,
): Promise<Array<{ id: string; type: string; fontSize: string }>> {
  return page.evaluate(() => {
    const results: Array<{ id: string; type: string; fontSize: string }> = [];
    document
      .querySelectorAll<HTMLInputElement>('input:not([type="hidden"]), textarea, select')
      .forEach((el) => {
        const fs = window.getComputedStyle(el).fontSize;
        const fsPx = parseFloat(fs);
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        results.push({
          id: el.id || el.name || el.placeholder || '(sin id)',
          type: el.type || el.tagName.toLowerCase(),
          fontSize: fs,
        });
        // Solo nos interesan los que sean < 16px
        return fsPx < 16;
      });
    return results.filter((r) => parseFloat(r.fontSize) < 16);
  });
}

/**
 * Pausa suficiente para que las animaciones de entrada terminen
 * (Framer Motion usa ~300ms por defecto).
 */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.waitForTimeout(400);
}
