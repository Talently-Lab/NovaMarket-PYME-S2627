import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/AuthPage';

/**
 * Suite: Registro
 * Verifica estructura, campos y accesibilidad.
 */
test.describe('RegisterPage', () => {
  let register: RegisterPage;

  test.beforeEach(async ({ page }) => {
    register = new RegisterPage(page);
    await register.goto();
  });

  test('Título "Crear cuenta" visible', async () => {
    await expect(register.heading).toBeVisible();
  });

  test('Campo nombre completo visible', async () => {
    await expect(register.nameInput).toBeVisible();
  });

  test('Campo email visible con type="email"', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Campo contraseña visible con type="password"', async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Botón "Crear cuenta" visible y habilitado', async () => {
    await expect(register.submitButton).toBeVisible();
    await expect(register.submitButton).toBeEnabled();
  });

  test('Link "Iniciá sesión" navega a /login', async ({ page }) => {
    await register.loginLink.click();
    await expect(page).toHaveURL('/login');
  });

  test('Hint de contraseña visible para guiar al usuario', async ({ page }) => {
    await expect(page.locator('.form-hint')).toBeVisible();
  });

  test('Formulario tiene atributos de autocompletado', async ({ page }) => {
    await expect(page.locator('input[autocomplete="name"]')).toHaveCount(1);
    await expect(page.locator('input[autocomplete="email"]')).toHaveCount(1);
    await expect(page.locator('input[autocomplete="new-password"]')).toHaveCount(1);
  });

  test('URL es /registro al cargar la página', async ({ page }) => {
    await expect(page).toHaveURL('/registro');
  });
});
