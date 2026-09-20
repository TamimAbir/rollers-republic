import { defineConfig, devices } from '@playwright/test';

/**
 * E2E for degraded mode: boots the Vite app with VITE_USE_REMOTE_API=true
 * pointed at a DEAD port (no server). The API client must fall back to the
 * bundled dataset AND surface the DegradedModeBanner — proving an outage is
 * never silent.
 */
export default defineConfig({
  testDir: './e2e/degraded',
  timeout: 30000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/dev-degraded.mjs',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
