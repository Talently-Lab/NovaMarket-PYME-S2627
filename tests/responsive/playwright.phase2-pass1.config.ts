/**
 * Config Fase 2 — Pasada 1: Chromium, 4 viewports (360×640, 390×844, 768×1024, 1024×768)
 * Ejecutar: npx playwright test --config=tests/responsive/playwright.phase2-pass1.config.ts
 */
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const BASE_URL =
  process.env.BASE_URL ?? 'https://novamarket-pyme-s2627.netlify.app';

export default defineConfig({
  testDir: path.join(__dirname, 'specs'),
  fullyParallel: false,        // serie para no saturar Netlify
  forbidOnly: false,
  retries: 1,
  timeout: 45_000,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: path.resolve(__dirname, '../../docs/qa/responsive-audit/playwright-report-p1'), open: 'never' }],
    ['json', { outputFile: path.resolve(__dirname, '../../docs/qa/responsive-audit/playwright-results-p1.json') }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: false,
  },

  projects: [
    {
      name: 'chromium-360',
      use: {
        channel: 'chromium',
        viewport: { width: 360, height: 640 },
        hasTouch: true,
        deviceScaleFactor: 2,
        userAgent:
          'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36',
      },
    },
    {
      name: 'chromium-390',
      use: {
        channel: 'chromium',
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        deviceScaleFactor: 3,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    },
    {
      name: 'chromium-768',
      use: {
        channel: 'chromium',
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
        deviceScaleFactor: 2,
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    },
    {
      name: 'chromium-1024ls',
      use: {
        channel: 'chromium',
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
        deviceScaleFactor: 2,
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    },
  ],
});
