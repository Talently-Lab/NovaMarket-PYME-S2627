import { defineConfig, devices } from '@playwright/test';

/**
 * Base URL:
 * - En CI o cuando se pasa BASE_URL → URL de Netlify (producción)
 * - En local sin BASE_URL → dev server local
 */
const BASE_URL =
  process.env.BASE_URL ||
  (process.env.CI
    ? 'https://novamarket-pyme-s2627.netlify.app'
    : 'http://localhost:5173');

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './reports/playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Ignora errores de certificado en previews de Netlify
    ignoreHTTPSErrors: false,
  },
  projects: [
    // Desktop
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Mobile
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
