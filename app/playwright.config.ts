import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
  testIgnore: ['e2e/degraded/**'],
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5173',
        // Pre-verified age consent so the 18+ AgeGate (SSOT §9.1) never blocks
        // E2E interactions. The gate itself is covered by unit tests.
        storageState: {
            cookies: [],
            origins: [
                {
                    origin: 'http://localhost:5173',
                    localStorage: [{ name: 'rr-age-verified', value: 'yes' }],
                },
            ],
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
    },
});