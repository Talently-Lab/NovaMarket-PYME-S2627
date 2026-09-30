import { Page, Locator } from '@playwright/test';

/**
 * BasePage — métodos comunes a todas las páginas
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async getTitle() {
    return this.page.title();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Header
  get logo(): Locator {
    return this.page.getByRole('link', { name: /novamarket/i }).first();
  }

  get themeToggle(): Locator {
    return this.page.getByRole('button', { name: /modo claro|modo oscuro/i });
  }

  get cartButton(): Locator {
    return this.page.getByRole('link', { name: /carrito/i });
  }

  get hamburgerButton(): Locator {
    return this.page.getByRole('button', { name: /abrir menú|cerrar menú/i });
  }

  get mobileNav(): Locator {
    return this.page.locator('#mobile-nav');
  }
}
