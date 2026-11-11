import { test, expect } from '@playwright/test';

/**
 * Suite: Header — tema, hamburger, accesibilidad
 */
test.describe('Header — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Logo visible y enlaza a home', async ({ page }) => {
    const logo = page.getByRole('link', { name: /novamarket/i }).first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('Navegación principal visible en desktop', async ({ page }) => {
    await expect(page.getByRole('link', { name: /inicio/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /catálogo/i }).first()).toBeVisible();
  });

  test('Botón carrito visible y navega a /carrito', async ({ page }) => {
    const cartBtn = page.getByRole('link', { name: /carrito/i });
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();
    await expect(page).toHaveURL('/carrito');
  });

  test('Toggle de tema existe y tiene aria-label correcto', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /modo claro|modo oscuro/i });
    await expect(toggle).toBeVisible();
  });

  test('Toggle de tema cambia el atributo data-theme', async ({ page }) => {
    const html = page.locator('html');
    const themeBefore = await html.getAttribute('data-theme');

    await page.getByRole('button', { name: /modo claro|modo oscuro/i }).click();

    const themeAfter = await html.getAttribute('data-theme');
    expect(themeAfter).not.toBe(themeBefore);
  });

  test('Header es sticky — visible al hacer scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000));
    const header = page.locator('.header');
    await expect(header).toBeVisible();
  });
});

test.describe('Header — mobile (hamburger)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Botón hamburger visible en mobile', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /abrir menú/i });
    await expect(hamburger).toBeVisible();
  });

  test('Botón Ingresar oculto en mobile (está en el menú)', async ({ page }) => {
    // El btn--primary del header se oculta en mobile
    const headerActions = page.locator('.header__actions .btn--primary');
    await expect(headerActions).toBeHidden();
  });

  test('Hamburger abre el menú mobile', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /abrir menú/i });
    await hamburger.click();
    const mobileNav = page.locator('#mobile-nav');
    await expect(mobileNav).toBeVisible();
  });

  test('Hamburger cierra el menú mobile al segundo clic', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /abrir menú/i });
    await hamburger.click();
    await expect(page.locator('#mobile-nav')).toBeVisible();

    await page.getByRole('button', { name: /cerrar menú/i }).click();
    await expect(page.locator('#mobile-nav')).toBeHidden();
  });

  test('Link en menú mobile navega y cierra el menú', async ({ page }) => {
    await page.getByRole('button', { name: /abrir menú/i }).click();
    await page.locator('#mobile-nav').getByRole('link', { name: /catálogo/i }).click();
    await expect(page).toHaveURL('/catalogo');
    await expect(page.locator('#mobile-nav')).toBeHidden();
  });
});
