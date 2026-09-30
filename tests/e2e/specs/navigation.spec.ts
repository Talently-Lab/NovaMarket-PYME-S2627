import { test, expect } from '@playwright/test';

/**
 * Suite: Navegación y rutas
 * Verifica que todas las rutas públicas carguen correctamente
 * y que React Router maneje el 404 sin romper.
 */
test.describe('Navegación — rutas públicas', () => {
  const PUBLIC_ROUTES = [
    { path: '/',            description: 'Home' },
    { path: '/catalogo',    description: 'Catálogo' },
    { path: '/carrito',     description: 'Carrito' },
    { path: '/login',       description: 'Login' },
    { path: '/registro',    description: 'Registro' },
  ];

  for (const { path, description } of PUBLIC_ROUTES) {
    test(`${description} (${path}) — carga sin error`, async ({ page }) => {
      const response = await page.goto(path);
      // Netlify SPA redirect devuelve 200 para todas las rutas
      expect(response?.status()).toBe(200);
      // No debe mostrar página de error del servidor
      await expect(page.locator('body')).not.toContainText('Application error');
      await expect(page.locator('body')).not.toContainText('500');
    });
  }

  test('Ruta inexistente muestra página 404 personalizada', async ({ page }) => {
    await page.goto('/ruta-que-no-existe');
    // React Router renderiza NotFoundPage
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('link', { name: /volver al inicio/i })).toBeVisible();
  });

  test('Desde 404 el link "Volver al inicio" navega a home', async ({ page }) => {
    await page.goto('/ruta-inexistente');
    await page.getByRole('link', { name: /volver al inicio/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('Refrescar página en /catalogo no da 404 (SPA redirect activo)', async ({ page }) => {
    await page.goto('/catalogo');
    await page.reload();
    await expect(page.getByRole('heading', { name: /catálogo/i })).toBeVisible();
  });

  test('El título del documento es correcto', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NovaMarket/i);
  });

  test('Links del header navegan correctamente', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /catálogo/i }).first().click();
    await expect(page).toHaveURL('/catalogo');

    await page.getByRole('link', { name: /novamarket/i }).first().click();
    await expect(page).toHaveURL('/');
  });
});
