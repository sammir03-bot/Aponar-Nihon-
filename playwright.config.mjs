import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Keep CI deterministic and avoid Chromium crashes on shared GitHub runners.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['line'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/playwright-results.json' }]
      ]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 7'] }
    },
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1 --directory _site',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
