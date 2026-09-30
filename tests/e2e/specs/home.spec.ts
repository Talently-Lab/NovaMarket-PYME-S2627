import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Suite: Home — hero, categorías, productos, footer
 */
test.describe('HomePage', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  // Hero
  test('Hero — título principal visible', async () => {
    await expect(home.heroTitle).toBeVisible();
    await expect(home.heroTitle).toContainText(/todo lo que necesitás/i);
  });

  test('Hero — CTA "Explorar catálogo" navega a /catalogo', async ({ page }) => {
    await home.heroCTA.click();
    await expect(page).toHaveURL('/catalogo');
  });

  test('Hero — CTA "Crear cuenta" navega a /registro', async ({ page }) => {
    await home.heroRegisterCTA.click();
    await expect(page).toHaveURL('/registro');
  });

  // Categorías
  test('Sección Categorías visible con al menos 4 cards', async () => {
    await expect(home.categoriesSection).toBeVisible();
    const count = await home.categoryCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Cards de categoría tienen nombre visible', async () => {
    const cards = home.categoryCards;
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('.category-card__name')).toBeVisible();
    }
  });

  test('Click en categoría navega al catálogo', async ({ page }) => {
    await home.categoryCards.first().click();
    await expect(page).toHaveURL(/\/catalogo/);
  });

  // Productos destacados
  test('Sección Destacados visible con cards de productos', async () => {
    await expect(home.featuredSection).toBeVisible();
    const count = await home.productCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Cards de productos tienen título, precio y botón Agregar', async () => {
    const card = home.productCards.first();
    await expect(card.locator('.card__title')).toBeVisible();
    await expect(card.locator('.card__price')).toBeVisible();
    await expect(card.getByRole('button', { name: /agregar/i })).toBeVisible();
  });

  // Footer
  test('Footer visible con logo', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/novamarket/i).first()).toBeVisible();
  });

  test('Footer — links de navegación presentes', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer.getByRole('link', { name: /catálogo/i }).first()).toBeVisible();
  });

  test('Footer — copyright con año actual', async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(page.locator('.footer__copy')).toContainText(year);
  });

  test('Footer — iconos de redes sociales presentes', async ({ page }) => {
    const socialLinks = page.locator('.footer__social-link');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Footer — sección de medios de pago visible', async ({ page }) => {
    const payments = page.locator('.footer__payments');
    await expect(payments).toBeVisible();
  });
});
