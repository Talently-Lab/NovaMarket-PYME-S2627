import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/AuthPage';

/**
 * Suite: Login
 * Verifica estructura, campos y accesibilidad.
 * La lógica de autenticación se probará cuando el backend esté listo.
 */
test.describe('LoginPage', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test('Título "Bienvenido" visible', async () => {
    await expect(login.heading).toBeVisible();
  });

  test('Campo email visible y con type="email"', async ({ page }) => {
    const input = page.locator('input[type="email"]');
    await expect(input).toBeVisible();
  });

  test('Campo contraseña visible y con type="password"', async ({ page }) => {
    const input = page.locator('input[type="password"]');
    await expect(input).toBeVisible();
  });

  test('Botón "Ingresar" visible y habilitado', async () => {
    await expect(login.submitButton).toBeVisible();
    await expect(login.submitButton).toBeEnabled();
  });

  test('Link "Registrate" navega a /registro', async ({ page }) => {
    await login.registerLink.click();
    await expect(page).toHaveURL('/registro');
  });

  test('Formulario tiene atributos de autocompletado', async ({ page }) => {
    await expect(page.locator('input[autocomplete="email"]')).toHaveCount(1);
    await expect(page.locator('input[autocomplete="current-password"]')).toHaveCount(1);
  });

  test('URL es /login al cargar la página', async ({ page }) => {
    await expect(page).toHaveURL('/login');
  });
});
