import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E for Marginalia Fighters.
 * Boots the Angular dev server (or a preview) and drives real keyboard input.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // single shared game instance; keep runs deterministic
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:4300',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start -- --port 4300',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
