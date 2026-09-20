import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for remote-API mode: boots the reference API server (server/)
 * AND the Vite dev server pointed at it, so tests exercise the real backend.
 *
 * Run: VITE_USE_REMOTE_API=true npx playwright test --config=playwright.remote.config.ts
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5173',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            command: 'node ../server/index.js',
            url: 'http://localhost:8787/products',
            reuseExistingServer: !process.env.CI,
            timeout: 60000,
        },
        {
            command: 'node scripts/dev-remote.mjs',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
            timeout: 60000,
        },
    ],
});
