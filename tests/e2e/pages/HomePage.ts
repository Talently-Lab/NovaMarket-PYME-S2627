import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  get heroTitle(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  get heroCTA(): Locator {
    return this.page.getByRole('link', { name: /explorar catálogo/i });
  }

  get heroRegisterCTA(): Locator {
    return this.page.getByRole('link', { name: /crear cuenta/i });
  }

  get categoriesSection(): Locator {
    return this.page.getByRole('heading', { name: /categorías/i });
  }

  get categoryCards(): Locator {
    return this.page.locator('.category-card');
  }

  get featuredSection(): Locator {
    return this.page.getByRole('heading', { name: /destacados/i });
  }

  get productCards(): Locator {
    return this.page.locator('.card');
  }
}
