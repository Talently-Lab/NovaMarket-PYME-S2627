import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/catalogo');
    await this.waitForLoad();
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /catálogo/i });
  }
}
