import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/login');
    await this.waitForLoad();
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /bienvenido/i });
  }

  get emailInput(): Locator {
    return this.page.getByLabel(/email/i);
  }

  get passwordInput(): Locator {
    return this.page.getByLabel(/contraseña/i);
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /ingresar/i });
  }

  get registerLink(): Locator {
    return this.page.getByRole('link', { name: /registrate/i });
  }
}

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/registro');
    await this.waitForLoad();
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /crear cuenta/i });
  }

  get nameInput(): Locator {
    return this.page.getByLabel(/nombre completo/i);
  }

  get emailInput(): Locator {
    return this.page.getByLabel(/email/i);
  }

  get passwordInput(): Locator {
    return this.page.getByLabel(/contraseña/i);
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /crear cuenta/i });
  }

  get loginLink(): Locator {
    return this.page.getByRole('link', { name: /iniciá sesión/i });
  }
}
